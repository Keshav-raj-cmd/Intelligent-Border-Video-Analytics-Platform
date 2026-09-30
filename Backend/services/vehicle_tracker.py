from ultralytics import YOLO

class VehicleTracker:
    @staticmethod
    def track_vehicles(model, frame_bgr, conf=0.4):
        """
        Runs YOLO tracking on the frame using ByteTrack.
        Returns the Ultralytics Results object which includes tracking IDs.
        """
        results = model.track(frame_bgr, conf=conf, persist=True, tracker="bytetrack.yaml", verbose=False)
        return results[0]
