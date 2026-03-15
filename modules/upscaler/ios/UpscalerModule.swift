import Foundation
import CoreML
import UIKit
import AVFoundation

@objc(UpscalerModule)
class UpscalerModule: NSObject {

    private var model: MLModel?
    private var isCancelled = false
    private let tileSize = 256
    private let overlap = 16
    private let batchSize = 4

    // MARK: - Public API

    /// 動画の超解像処理を実行
    /// - Parameters:
    ///   - videoUri: 入力動画のファイルパス
    ///   - scale: アップスケール倍率 (2 or 4)
    ///   - options: 追加オプション (denoise, sharpen, colorEnhance)
    ///   - resolve: Promise resolve
    ///   - reject: Promise reject
    @objc func upscaleVideo(
        _ videoUri: String,
        scale: Int,
        options: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        isCancelled = false

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }

            do {
                // 1. CoreMLモデル読み込み
                try self.loadModel(scale: scale)

                // 2. 動画をフレームに分解
                let inputURL = URL(fileURLWithPath: videoUri)
                let (frames, fps, audioURL) = try FrameExtractor.extractFrames(from: inputURL)

                let totalFrames = frames.count
                var enhancedFrames: [CGImage] = []
                let startTime = Date()

                // 3. 各フレームをAI超解像
                for (index, frame) in frames.enumerated() {
                    if self.isCancelled {
                        reject("CANCELLED", "Processing was cancelled", nil)
                        return
                    }

                    let frameStartTime = Date()
                    let enhanced = try self.upscaleFrame(image: frame, scale: scale)
                    enhancedFrames.append(enhanced)

                    let elapsed = Date().timeIntervalSince(startTime)
                    let avgTimePerFrame = elapsed / Double(index + 1)
                    let remaining = avgTimePerFrame * Double(totalFrames - index - 1)

                    // プログレスイベント送信
                    self.sendEvent("onProgress", body: [
                        "currentFrame": index + 1,
                        "totalFrames": totalFrames,
                        "estimatedTimeRemaining": remaining
                    ])

                    self.sendEvent("onFrameComplete", body: [
                        "frameIndex": index,
                        "processingTime": Date().timeIntervalSince(frameStartTime)
                    ])
                }

                // 4. フレーム結合 + 音声マージ
                let outputURL = try VideoAssembler.assembleVideo(
                    frames: enhancedFrames,
                    fps: fps,
                    audioURL: audioURL,
                    scale: scale
                )

                resolve(outputURL.path)

            } catch {
                self.sendEvent("onError", body: [
                    "code": "PROCESSING_ERROR",
                    "message": error.localizedDescription
                ])
                reject("PROCESSING_ERROR", error.localizedDescription, error)
            }
        }
    }

    /// 処理をキャンセル
    @objc func cancelProcessing(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        isCancelled = true
        resolve(nil)
    }

    /// デバイス能力の取得
    @objc func getDeviceCapability(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        var sysinfo = utsname()
        uname(&sysinfo)
        let machine = withUnsafePointer(to: &sysinfo.machine) {
            $0.withMemoryRebound(to: CChar.self, capacity: 1) {
                String(validatingUTF8: $0) ?? "unknown"
            }
        }

        let totalMemory = ProcessInfo.processInfo.physicalMemory
        let memoryMB = totalMemory / (1024 * 1024)

        // A14以降はANE搭載
        let hasANE = true // iPhone 12以降をターゲット

        // メモリに応じたバッチサイズ推奨
        let recommendedBatch: Int
        if memoryMB >= 6144 {
            recommendedBatch = 8  // 6GB+ (Pro models)
        } else if memoryMB >= 4096 {
            recommendedBatch = 4  // 4GB+
        } else {
            recommendedBatch = 2  // 3GB
        }

        resolve([
            "chipset": machine,
            "hasANE": hasANE,
            "recommendedTileSize": 256,
            "recommendedBatchSize": recommendedBatch,
            "totalMemoryMB": memoryMB
        ])
    }

    // MARK: - Private

    private func loadModel(scale: Int) throws {
        if model != nil { return }

        let modelName = scale == 2 ? "RealESRGAN_x2plus" : "RealESRGAN_x4plus"
        guard let modelURL = Bundle.main.url(forResource: modelName, withExtension: "mlmodelc")
                ?? Bundle.main.url(forResource: modelName, withExtension: "mlpackage") else {
            throw NSError(domain: "UpscalerModule", code: -1,
                         userInfo: [NSLocalizedDescriptionKey: "CoreML model not found: \(modelName)"])
        }

        let config = MLModelConfiguration()
        config.computeUnits = .all // CPU + GPU + ANE
        model = try MLModel(contentsOf: modelURL, configuration: config)
    }

    /// 1フレームの超解像処理
    private func upscaleFrame(image: CGImage, scale: Int) throws -> CGImage {
        guard let model = model else {
            throw NSError(domain: "UpscalerModule", code: -2,
                         userInfo: [NSLocalizedDescriptionKey: "Model not loaded"])
        }

        // タイル分割
        let tiles = TileProcessor.split(image: image, tileSize: tileSize, overlap: overlap)

        // 各タイルにCoreML推論
        var upscaledTiles: [(CGImage, Int, Int)] = []

        for (tile, x, y) in tiles {
            // CGImage → MLMultiArray 変換
            let inputArray = try imageToMLMultiArray(tile, size: tileSize)

            let inputFeatures = try MLDictionaryFeatureProvider(dictionary: [
                "input": MLFeatureValue(multiArray: inputArray)
            ])

            let prediction = try model.prediction(from: inputFeatures)

            guard let outputArray = prediction.featureValue(for: "output")?.multiArrayValue else {
                throw NSError(domain: "UpscalerModule", code: -3,
                             userInfo: [NSLocalizedDescriptionKey: "Model output is nil"])
            }

            let outputSize = tileSize * scale
            let outputImage = try mlMultiArrayToImage(outputArray, width: outputSize, height: outputSize)
            upscaledTiles.append((outputImage, x * scale, y * scale))
        }

        // タイル結合
        let outputWidth = image.width * scale
        let outputHeight = image.height * scale
        return TileProcessor.merge(
            tiles: upscaledTiles,
            outputWidth: outputWidth,
            outputHeight: outputHeight,
            overlap: overlap * scale
        )
    }

    /// CGImage → MLMultiArray (1, 3, H, W) RGB normalized [0, 1]
    private func imageToMLMultiArray(_ image: CGImage, size: Int) throws -> MLMultiArray {
        let array = try MLMultiArray(shape: [1, 3, NSNumber(value: size), NSNumber(value: size)],
                                      dataType: .float32)

        guard let context = CGContext(
            data: nil,
            width: size, height: size,
            bitsPerComponent: 8,
            bytesPerRow: size * 4,
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else { throw NSError(domain: "UpscalerModule", code: -4, userInfo: nil) }

        context.draw(image, in: CGRect(x: 0, y: 0, width: size, height: size))

        guard let data = context.data else {
            throw NSError(domain: "UpscalerModule", code: -5, userInfo: nil)
        }

        let pixelBuffer = data.bindMemory(to: UInt8.self, capacity: size * size * 4)

        for y in 0..<size {
            for x in 0..<size {
                let offset = (y * size + x) * 4
                let r = Float(pixelBuffer[offset]) / 255.0
                let g = Float(pixelBuffer[offset + 1]) / 255.0
                let b = Float(pixelBuffer[offset + 2]) / 255.0

                array[[0, 0, NSNumber(value: y), NSNumber(value: x)] as [NSNumber]] = NSNumber(value: r)
                array[[0, 1, NSNumber(value: y), NSNumber(value: x)] as [NSNumber]] = NSNumber(value: g)
                array[[0, 2, NSNumber(value: y), NSNumber(value: x)] as [NSNumber]] = NSNumber(value: b)
            }
        }

        return array
    }

    /// MLMultiArray (1, 3, H, W) → CGImage
    private func mlMultiArrayToImage(_ array: MLMultiArray, width: Int, height: Int) throws -> CGImage {
        var pixelData = [UInt8](repeating: 0, count: width * height * 4)

        for y in 0..<height {
            for x in 0..<width {
                let r = array[[0, 0, NSNumber(value: y), NSNumber(value: x)] as [NSNumber]].floatValue
                let g = array[[0, 1, NSNumber(value: y), NSNumber(value: x)] as [NSNumber]].floatValue
                let b = array[[0, 2, NSNumber(value: y), NSNumber(value: x)] as [NSNumber]].floatValue

                let offset = (y * width + x) * 4
                pixelData[offset] = UInt8(max(0, min(255, r * 255)))
                pixelData[offset + 1] = UInt8(max(0, min(255, g * 255)))
                pixelData[offset + 2] = UInt8(max(0, min(255, b * 255)))
                pixelData[offset + 3] = 255
            }
        }

        let colorSpace = CGColorSpaceCreateDeviceRGB()
        guard let context = CGContext(
            data: &pixelData,
            width: width, height: height,
            bitsPerComponent: 8,
            bytesPerRow: width * 4,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ), let cgImage = context.makeImage() else {
            throw NSError(domain: "UpscalerModule", code: -6, userInfo: nil)
        }

        return cgImage
    }

    // MARK: - Event Emitter

    private func sendEvent(_ name: String, body: [String: Any]) {
        // React Native EventEmitter bridge
        DispatchQueue.main.async {
            NotificationCenter.default.post(
                name: NSNotification.Name(name),
                object: nil,
                userInfo: body
            )
        }
    }

    // MARK: - React Native Bridge Requirements

    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc func supportedEvents() -> [String] {
        return ["onProgress", "onFrameComplete", "onError"]
    }
}
