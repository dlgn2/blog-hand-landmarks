package com.handlandmarks.handlandmarksframeprocessor

import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy

class HandLandmarksFrameProcessorPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?) :
        FrameProcessorPlugin() {

  // Tek seferlik model yükleme vs. istenirse static benzeri bir yapı kullanılabilir,
  // ama burada örnek olarak her oluşturulduğunda yükleniyor.
  private val handLandmarker: HandLandmarker

  init {
    val baseOptions = BaseOptions.builder().setModelAssetPath("hand_landmarker.task").build()

    val handLandmarkerOptions =
            HandLandmarker.HandLandmarkerOptions.builder()
                    .setBaseOptions(baseOptions)
                    .setRunningMode(RunningMode.VIDEO)
                    .setMinHandDetectionConfidence(0.5f)
                    .setMinHandPresenceConfidence(0.5f)
                    .setMinTrackingConfidence(0.5f)
                    .setNumHands(2)
                    .build()

    handLandmarker =
            HandLandmarker.createFromOptions(
                    proxy.context.applicationContext,
                    handLandmarkerOptions
            )
  }

  override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
    return try {
      // Frame'den bitmap alıp MPImage'e dönüştür
      val mpImage = BitmapImageBuilder(frame.imageProxy.toBitmap()).build()

      // Video modunda tespit
      val result = handLandmarker.detectForVideo(mpImage, frame.timestamp)

      // Swift tarafındaki gibi: [[{x:0.1,y:0.2},{x:0.3,y:0.4}], [ ... ] ]
      val landmarks = mutableListOf<List<Map<String, Double>>>()

      // Her el için landmarkları topla
      for (handLandmarks in result.landmarks()) {
        val handLandmarksList = mutableListOf<Map<String, Double>>()
        for (landmark in handLandmarks) {
          handLandmarksList.add(
                  mapOf("x" to landmark.x().toDouble(), "y" to landmark.y().toDouble())
          )
        }
        landmarks.add(handLandmarksList)
      }

      // Swift'te olduğu gibi: ["handLandmarks": [...]] şeklinde dön
      mapOf("handLandmarks" to landmarks)
    } catch (e: Exception) {
      e.printStackTrace()
      null
    }
  }
}
