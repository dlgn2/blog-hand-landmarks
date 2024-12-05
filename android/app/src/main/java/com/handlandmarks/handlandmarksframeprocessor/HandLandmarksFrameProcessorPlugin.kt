package com.handlandmarks.handlandmarksframeprocessor

import android.util.Log
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy

class HandLandmarksFrameProcessorPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?) :
        FrameProcessorPlugin() {
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

      val mpImage = BitmapImageBuilder(frame.imageProxy.toBitmap()).build()

      Log.d("HandLandmarks", "timestamp: ${frame.timestamp}")
      // Process the frame in video mode
      val result = handLandmarker.detectForVideo(mpImage, frame.timestamp) // Convert to ms

      val landmarks = mutableListOf<List<Map<String, Double>>>()

      // Process detected landmarks
      for (handLandmarks in result.landmarks()) {
        val handLandmarksList = mutableListOf<Map<String, Double>>()
        for (landmark in handLandmarks) {
          handLandmarksList.add(
                  mapOf(
                          "x" to landmark.x().toDouble(), // Convert to Double
                          "y" to landmark.y().toDouble() // Convert to Double
                  )
          )
        }
        landmarks.add(handLandmarksList)
      }

      landmarks
    } catch (e: Exception) {
      e.printStackTrace()
      null
    }
  }
}
