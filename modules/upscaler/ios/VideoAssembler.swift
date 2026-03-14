import AVFoundation
import CoreGraphics
import UIKit

/// 超解像フレームを動画に再結合し、音声をマージするモジュール
class VideoAssembler {

    /// フレーム配列を動画に結合
    /// - Parameters:
    ///   - frames: 超解像済みCGImage配列
    ///   - fps: フレームレート
    ///   - audioURL: 音声ファイルURL (nil可)
    ///   - scale: アップスケール倍率
    /// - Returns: 出力動画URL
    static func assembleVideo(
        frames: [CGImage],
        fps: Float,
        audioURL: URL?,
        scale: Int
    ) throws -> URL {
        guard let firstFrame = frames.first else {
            throw NSError(domain: "VideoAssembler", code: -1,
                         userInfo: [NSLocalizedDescriptionKey: "No frames to assemble"])
        }

        let width = firstFrame.width
        let height = firstFrame.height

        let outputURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("upscaled_\(UUID().uuidString).mp4")

        // 既存ファイルがあれば削除
        try? FileManager.default.removeItem(at: outputURL)

        // AVAssetWriter セットアップ
        let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)

        let videoSettings: [String: Any] = [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: width,
            AVVideoHeightKey: height,
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: calculateBitrate(width: width, height: height, fps: fps),
                AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
                AVVideoH264EntropyModeKey: AVVideoH264EntropyModeCABAC,
            ]
        ]

        let videoInput = AVAssetWriterInput(
            mediaType: .video,
            outputSettings: videoSettings
        )
        videoInput.expectsMediaDataInRealTime = false

        let adaptor = AVAssetWriterInputPixelBufferAdaptor(
            assetWriterInput: videoInput,
            sourcePixelBufferAttributes: [
                kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
                kCVPixelBufferWidthKey as String: width,
                kCVPixelBufferHeightKey as String: height,
            ]
        )

        writer.add(videoInput)
        writer.startWriting()
        writer.startSession(atSourceTime: .zero)

        // フレームを書き込み
        let frameDuration = CMTime(value: 1, timescale: CMTimeScale(fps))

        for (index, frame) in frames.enumerated() {
            while !videoInput.isReadyForMoreMediaData {
                Thread.sleep(forTimeInterval: 0.01)
            }

            let presentationTime = CMTime(
                value: CMTimeValue(index),
                timescale: CMTimeScale(fps)
            )

            guard let pixelBuffer = createPixelBuffer(from: frame, width: width, height: height) else {
                continue
            }

            adaptor.append(pixelBuffer, withPresentationTime: presentationTime)
        }

        videoInput.markAsFinished()

        let semaphore = DispatchSemaphore(value: 0)
        writer.finishWriting {
            semaphore.signal()
        }
        semaphore.wait()

        guard writer.status == .completed else {
            throw writer.error ?? NSError(domain: "VideoAssembler", code: -2,
                                          userInfo: [NSLocalizedDescriptionKey: "Video writing failed"])
        }

        // 音声マージ
        if let audioURL = audioURL {
            let finalURL = try mergeAudio(videoURL: outputURL, audioURL: audioURL)
            // 中間ファイル削除
            try? FileManager.default.removeItem(at: outputURL)
            return finalURL
        }

        return outputURL
    }

    // MARK: - Private

    /// 音声と動画を結合
    private static func mergeAudio(videoURL: URL, audioURL: URL) throws -> URL {
        let composition = AVMutableComposition()

        let videoAsset = AVURLAsset(url: videoURL)
        let audioAsset = AVURLAsset(url: audioURL)

        // ビデオトラック追加
        guard let videoTrack = composition.addMutableTrack(
            withMediaType: .video,
            preferredTrackID: kCMPersistentTrackID_Invalid
        ) else { throw NSError(domain: "VideoAssembler", code: -3, userInfo: nil) }

        if let sourceVideoTrack = videoAsset.tracks(withMediaType: .video).first {
            try videoTrack.insertTimeRange(
                CMTimeRange(start: .zero, duration: videoAsset.duration),
                of: sourceVideoTrack,
                at: .zero
            )
        }

        // オーディオトラック追加
        if let audioCompositionTrack = composition.addMutableTrack(
            withMediaType: .audio,
            preferredTrackID: kCMPersistentTrackID_Invalid
        ), let sourceAudioTrack = audioAsset.tracks(withMediaType: .audio).first {
            let audioDuration = min(audioAsset.duration, videoAsset.duration)
            try audioCompositionTrack.insertTimeRange(
                CMTimeRange(start: .zero, duration: audioDuration),
                of: sourceAudioTrack,
                at: .zero
            )
        }

        // エクスポート
        let finalURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("final_\(UUID().uuidString).mp4")

        try? FileManager.default.removeItem(at: finalURL)

        guard let exportSession = AVAssetExportSession(
            asset: composition,
            presetName: AVAssetExportPresetHighestQuality
        ) else { throw NSError(domain: "VideoAssembler", code: -4, userInfo: nil) }

        exportSession.outputURL = finalURL
        exportSession.outputFileType = .mp4
        exportSession.shouldOptimizeForNetworkUse = true

        let semaphore = DispatchSemaphore(value: 0)
        exportSession.exportAsynchronously {
            semaphore.signal()
        }
        semaphore.wait()

        guard exportSession.status == .completed else {
            throw exportSession.error ?? NSError(domain: "VideoAssembler", code: -5, userInfo: nil)
        }

        return finalURL
    }

    /// CGImage → CVPixelBuffer
    private static func createPixelBuffer(from image: CGImage, width: Int, height: Int) -> CVPixelBuffer? {
        var pixelBuffer: CVPixelBuffer?
        let attrs: [String: Any] = [
            kCVPixelBufferCGImageCompatibilityKey as String: true,
            kCVPixelBufferCGBitmapContextCompatibilityKey as String: true,
        ]

        let status = CVPixelBufferCreate(
            kCFAllocatorDefault,
            width, height,
            kCVPixelFormatType_32BGRA,
            attrs as CFDictionary,
            &pixelBuffer
        )

        guard status == kCVReturnSuccess, let buffer = pixelBuffer else { return nil }

        CVPixelBufferLockBaseAddress(buffer, [])
        defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

        guard let context = CGContext(
            data: CVPixelBufferGetBaseAddress(buffer),
            width: width, height: height,
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
        ) else { return nil }

        context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
        return buffer
    }

    /// ビットレート計算 (解像度とFPSに応じて)
    private static func calculateBitrate(width: Int, height: Int, fps: Float) -> Int {
        let pixels = width * height
        // 1080p 30fps → 約8Mbps
        let baseBitrate = Double(pixels) * Double(fps) * 0.07
        return Int(min(baseBitrate, 20_000_000)) // 最大20Mbps
    }
}
