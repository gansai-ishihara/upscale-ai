import AVFoundation
import CoreGraphics

/// FFmpegの代替として AVFoundation を使用してフレーム抽出を行うモジュール
/// (ffmpeg-kit はフレーム分解/結合に使用するが、ネイティブAPIでも可能)
class FrameExtractor {

    /// 動画からフレームを抽出
    /// - Parameter url: 入力動画のURL
    /// - Returns: (フレーム配列, fps, 音声ファイルURL)
    static func extractFrames(from url: URL) throws -> ([CGImage], Float, URL?) {
        let asset = AVURLAsset(url: url)
        let videoTrack = asset.tracks(withMediaType: .video).first

        guard let track = videoTrack else {
            throw NSError(domain: "FrameExtractor", code: -1,
                         userInfo: [NSLocalizedDescriptionKey: "No video track found"])
        }

        let fps = track.nominalFrameRate
        let duration = CMTimeGetSeconds(asset.duration)
        let totalFrames = Int(duration * Double(fps))

        // フレーム生成器
        let generator = AVAssetImageGenerator(asset: asset)
        generator.appliesPreferredTrackTransform = true
        generator.requestedTimeToleranceBefore = .zero
        generator.requestedTimeToleranceAfter = .zero

        // 最大解像度で取得
        generator.maximumSize = CGSize(
            width: track.naturalSize.width,
            height: track.naturalSize.height
        )

        var frames: [CGImage] = []

        // 各フレームのタイムスタンプを計算
        let frameDuration = CMTime(value: 1, timescale: CMTimeScale(fps))

        for i in 0..<totalFrames {
            let time = CMTime(value: CMTimeValue(i), timescale: CMTimeScale(fps))

            do {
                let (image, _) = try generator.copyCGImage(at: time, actualTime: nil)
                frames.append(image)
            } catch {
                // フレーム取得に失敗した場合、前のフレームを複製
                if let lastFrame = frames.last {
                    frames.append(lastFrame)
                }
            }
        }

        // 音声の抽出
        let audioURL = try extractAudio(from: asset)

        return (frames, fps, audioURL)
    }

    /// 音声トラックを別ファイルとして抽出
    private static func extractAudio(from asset: AVAsset) throws -> URL? {
        guard asset.tracks(withMediaType: .audio).first != nil else {
            return nil // 音声なし
        }

        let outputURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("audio_\(UUID().uuidString).m4a")

        // 既存ファイルがあれば削除
        try? FileManager.default.removeItem(at: outputURL)

        guard let exportSession = AVAssetExportSession(
            asset: asset,
            presetName: AVAssetExportPresetAppleM4A
        ) else {
            throw NSError(domain: "FrameExtractor", code: -2,
                         userInfo: [NSLocalizedDescriptionKey: "Cannot create audio export session"])
        }

        exportSession.outputURL = outputURL
        exportSession.outputFileType = .m4a

        let semaphore = DispatchSemaphore(value: 0)
        var exportError: Error?

        exportSession.exportAsynchronously {
            if exportSession.status == .failed {
                exportError = exportSession.error
            }
            semaphore.signal()
        }

        semaphore.wait()

        if let error = exportError {
            throw error
        }

        return outputURL
    }
}
