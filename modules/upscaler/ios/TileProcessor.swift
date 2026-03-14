import CoreGraphics
import UIKit

/// フレームをタイルに分割し、超解像後にブレンド結合するモジュール
class TileProcessor {

    /// フレームを tileSize x tileSize のタイルに分割
    /// - Parameters:
    ///   - image: 入力フレーム (CGImage)
    ///   - tileSize: タイルサイズ (推奨: 256)
    ///   - overlap: オーバーラップ (推奨: 16) - タイル境界の繋ぎ目防止
    /// - Returns: (タイル画像, x座標, y座標) の配列
    static func split(
        image: CGImage,
        tileSize: Int,
        overlap: Int
    ) -> [(CGImage, Int, Int)] {
        let width = image.width
        let height = image.height
        let step = tileSize - overlap
        var tiles: [(CGImage, Int, Int)] = []

        var y = 0
        while y < height {
            var x = 0
            while x < width {
                // タイル領域の計算 (画像端の処理)
                let tileX = min(x, max(0, width - tileSize))
                let tileY = min(y, max(0, height - tileSize))
                let tileW = min(tileSize, width - tileX)
                let tileH = min(tileSize, height - tileY)

                let rect = CGRect(x: tileX, y: tileY, width: tileW, height: tileH)

                if let cropped = image.cropping(to: rect) {
                    // タイルサイズに満たない場合はパディング
                    if tileW < tileSize || tileH < tileSize {
                        if let padded = padImage(cropped, toSize: tileSize) {
                            tiles.append((padded, tileX, tileY))
                        }
                    } else {
                        tiles.append((cropped, tileX, tileY))
                    }
                }

                x += step
                if x >= width && x - step + tileSize < width {
                    x = width - tileSize // 最後のタイルは端に合わせる
                } else if x >= width {
                    break
                }
            }

            y += step
            if y >= height && y - step + tileSize < height {
                y = height - tileSize
            } else if y >= height {
                break
            }
        }

        return tiles
    }

    /// 超解像済みタイルをリニアブレンドで結合してフルフレームを復元
    /// - Parameters:
    ///   - tiles: (タイル画像, x座標, y座標) の配列
    ///   - outputWidth: 出力幅
    ///   - outputHeight: 出力高さ
    ///   - overlap: オーバーラップサイズ (スケール後)
    /// - Returns: 結合されたフルフレーム
    static func merge(
        tiles: [(CGImage, Int, Int)],
        outputWidth: Int,
        outputHeight: Int,
        overlap: Int
    ) -> CGImage {
        // 重み付き合成用バッファ
        var colorBuffer = [Float](repeating: 0, count: outputWidth * outputHeight * 3)
        var weightBuffer = [Float](repeating: 0, count: outputWidth * outputHeight)

        for (tile, tileX, tileY) in tiles {
            let tileW = tile.width
            let tileH = tile.height

            // タイルのピクセルデータ取得
            guard let pixelData = getPixelData(from: tile) else { continue }

            for py in 0..<tileH {
                for px in 0..<tileW {
                    let outX = tileX + px
                    let outY = tileY + py

                    guard outX < outputWidth && outY < outputHeight else { continue }

                    // リニアブレンド重み (オーバーラップ領域で徐々に減衰)
                    let weight = blendWeight(
                        x: px, y: py,
                        width: tileW, height: tileH,
                        overlap: overlap
                    )

                    let srcIdx = (py * tileW + px) * 4
                    let dstIdx = outY * outputWidth + outX

                    colorBuffer[dstIdx * 3 + 0] += Float(pixelData[srcIdx]) * weight
                    colorBuffer[dstIdx * 3 + 1] += Float(pixelData[srcIdx + 1]) * weight
                    colorBuffer[dstIdx * 3 + 2] += Float(pixelData[srcIdx + 2]) * weight
                    weightBuffer[dstIdx] += weight
                }
            }
        }

        // 正規化してCGImage生成
        var outputPixels = [UInt8](repeating: 0, count: outputWidth * outputHeight * 4)
        for i in 0..<(outputWidth * outputHeight) {
            let w = max(weightBuffer[i], 1e-6)
            outputPixels[i * 4 + 0] = UInt8(max(0, min(255, colorBuffer[i * 3 + 0] / w)))
            outputPixels[i * 4 + 1] = UInt8(max(0, min(255, colorBuffer[i * 3 + 1] / w)))
            outputPixels[i * 4 + 2] = UInt8(max(0, min(255, colorBuffer[i * 3 + 2] / w)))
            outputPixels[i * 4 + 3] = 255
        }

        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let context = CGContext(
            data: &outputPixels,
            width: outputWidth, height: outputHeight,
            bitsPerComponent: 8, bytesPerRow: outputWidth * 4,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        )!

        return context.makeImage()!
    }

    // MARK: - Private helpers

    /// リニアブレンド重み計算
    /// オーバーラップ領域では端に近いほど重みが小さくなる
    private static func blendWeight(x: Int, y: Int, width: Int, height: Int, overlap: Int) -> Float {
        guard overlap > 0 else { return 1.0 }

        let wx: Float
        if x < overlap {
            wx = Float(x) / Float(overlap)
        } else if x >= width - overlap {
            wx = Float(width - 1 - x) / Float(overlap)
        } else {
            wx = 1.0
        }

        let wy: Float
        if y < overlap {
            wy = Float(y) / Float(overlap)
        } else if y >= height - overlap {
            wy = Float(height - 1 - y) / Float(overlap)
        } else {
            wy = 1.0
        }

        return max(wx * wy, 1e-4)
    }

    /// 画像を正方形にパディング (黒で埋める)
    private static func padImage(_ image: CGImage, toSize size: Int) -> CGImage? {
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        guard let context = CGContext(
            data: nil,
            width: size, height: size,
            bitsPerComponent: 8, bytesPerRow: size * 4,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else { return nil }

        context.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1))
        context.fill(CGRect(x: 0, y: 0, width: size, height: size))
        context.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))

        return context.makeImage()
    }

    /// CGImageからピクセルデータ (RGBA) を取得
    private static func getPixelData(from image: CGImage) -> [UInt8]? {
        let width = image.width
        let height = image.height
        var pixelData = [UInt8](repeating: 0, count: width * height * 4)

        let colorSpace = CGColorSpaceCreateDeviceRGB()
        guard let context = CGContext(
            data: &pixelData,
            width: width, height: height,
            bitsPerComponent: 8, bytesPerRow: width * 4,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else { return nil }

        context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
        return pixelData
    }
}
