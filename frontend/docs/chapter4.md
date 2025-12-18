---
title: "Chapter 4: Perception Systems"
description: "Understand vision, depth sensing, SLAM, and sensor fusion in robots."
sidebar_position: 4
---

# Perception Systems

Perception is the foundation of Physical AI, enabling robots to understand and interact with their environment. This chapter explores the sensors, algorithms, and systems that give robots the ability to "see" and comprehend the world around them.

## Introduction to Robot Perception

### The Perception Challenge

Robots face unique perception challenges compared to humans:

- **Sensor Limitations**: No sensor perfectly captures reality
- **Real-Time Requirements**: Processing must keep pace with robot movement
- **Uncertainty**: All measurements contain noise and errors
- **Dynamic Environments**: The world constantly changes

### The Perception Pipeline

A typical perception system follows this flow:

```
┌─────────────────────────────────────────────────────────────┐
│                   Perception Pipeline                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Sensors ──► Preprocessing ──► Feature Extraction ──►       │
│                                                              │
│  ──► Object Recognition ──► Scene Understanding ──►         │
│                                                              │
│  ──► World Model Update                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Vision Sensors

### RGB Cameras

Standard cameras capture color images:

**Key Parameters:**
- **Resolution**: Pixel dimensions (e.g., 1920×1080)
- **Frame Rate**: Images per second (FPS)
- **Field of View (FOV)**: Angular coverage
- **Dynamic Range**: Light sensitivity range

**Camera Models:**
The pinhole camera model describes image formation:

```
u = fx * (X/Z) + cx
v = fy * (Y/Z) + cy
```

Where:
- (X, Y, Z): 3D point coordinates
- (u, v): Pixel coordinates
- (fx, fy): Focal lengths
- (cx, cy): Principal point

### Depth Cameras

Depth cameras provide per-pixel distance measurements:

**Structured Light**
- Projects known patterns onto the scene
- Measures pattern distortion to compute depth
- Example: Intel RealSense D400 series

**Time of Flight (ToF)**
- Measures light round-trip time
- Direct depth measurement
- Example: Microsoft Azure Kinect

**Stereo Vision**
- Uses two cameras to triangulate depth
- Mimics human binocular vision
- Requires texture for matching

### Event Cameras

Neuromorphic sensors inspired by biological vision:

- **Asynchronous Output**: Events triggered by brightness change
- **High Dynamic Range**: >120 dB
- **Low Latency**: Microsecond response
- **Low Power**: Only responds to changes

Applications:
- High-speed tracking
- HDR scene capture
- Low-latency control

## LIDAR Systems

### Operating Principles

LIDAR (Light Detection and Ranging) uses laser pulses:

```
┌─────────────────────────────────────────────┐
│               LIDAR Operation               │
├─────────────────────────────────────────────┤
│                                             │
│  Laser Pulse ──► Object ──► Return Signal   │
│       │                          │          │
│       └──── Time of Flight ──────┘          │
│                                             │
│  Distance = (Speed of Light × Time) / 2    │
│                                             │
└─────────────────────────────────────────────┘
```

### LIDAR Types

**Mechanical Scanning**
- Rotating mirror/prism
- Wide FOV coverage
- Example: Velodyne, Ouster

**Solid-State**
- No moving parts
- More reliable, lower cost
- Limited FOV

**Flash LIDAR**
- Illuminates entire scene at once
- Very fast capture
- Limited range

### Point Cloud Processing

LIDAR produces 3D point clouds:

```python
import numpy as np

# Point cloud structure
point_cloud = np.array([
    [x1, y1, z1, intensity1],
    [x2, y2, z2, intensity2],
    # ... millions of points
])

# Ground plane segmentation using RANSAC
def segment_ground(points, threshold=0.1, iterations=100):
    best_plane = None
    best_inliers = []

    for _ in range(iterations):
        # Sample 3 random points
        sample = points[np.random.choice(len(points), 3)]
        # Fit plane
        plane = fit_plane(sample)
        # Count inliers
        distances = point_to_plane_distance(points, plane)
        inliers = np.where(distances < threshold)[0]

        if len(inliers) > len(best_inliers):
            best_inliers = inliers
            best_plane = plane

    return best_plane, best_inliers
```

## Object Detection and Recognition

### Deep Learning Approaches

Modern perception relies heavily on neural networks:

**2D Object Detection**

Popular architectures:
- **YOLO** (You Only Look Once): Real-time detection
- **Faster R-CNN**: High accuracy, two-stage
- **SSD** (Single Shot Detector): Balance of speed/accuracy

```python
# Example using a pre-trained detector
import torch
from torchvision.models.detection import fasterrcnn_resnet50_fpn

model = fasterrcnn_resnet50_fpn(pretrained=True)
model.eval()

# Inference
with torch.no_grad():
    predictions = model(image_tensor)

# predictions contains:
# - boxes: Bounding box coordinates
# - labels: Class predictions
# - scores: Confidence scores
```

**3D Object Detection**

Working with point clouds:
- **PointNet/PointNet++**: Direct point cloud processing
- **VoxelNet**: Voxel-based representation
- **PointPillars**: Pillar-based encoding

### Semantic Segmentation

Labeling every pixel/point with a class:

```
┌────────────────────────────────────────┐
│      Input Image                        │
│  ┌──────────────────────────────┐      │
│  │ [Car] [Road] [Person] [Sky]  │      │
│  │  ████   ░░░░   ▓▓▓▓   ____  │      │
│  │  ████   ░░░░   ▓▓▓▓   ____  │      │
│  └──────────────────────────────┘      │
│           ↓ CNN                        │
│      Segmentation Mask                 │
│  ┌──────────────────────────────┐      │
│  │ Each pixel labeled with class │      │
│  └──────────────────────────────┘      │
└────────────────────────────────────────┘
```

### Instance Segmentation

Combining detection with segmentation:
- Identifies individual object instances
- Provides precise object boundaries
- Example: Mask R-CNN

## SLAM: Simultaneous Localization and Mapping

### The SLAM Problem

SLAM solves two interrelated problems:

1. **Localization**: Where am I in the map?
2. **Mapping**: What does the environment look like?

The chicken-and-egg nature: need a map to localize, need position to build map.

### Visual SLAM

Using cameras for SLAM:

**Feature-Based SLAM**

```
┌─────────────────────────────────────────────────┐
│           Feature-Based Visual SLAM             │
├─────────────────────────────────────────────────┤
│                                                 │
│  Image ──► Feature Detection ──► Feature        │
│            (ORB, SIFT, etc.)     Matching       │
│                                     │           │
│                                     ▼           │
│  Map ◄── Bundle Adjustment ◄── Motion          │
│  Update      & Loop Closure     Estimation     │
│                                                 │
└─────────────────────────────────────────────────┘
```

Key algorithms:
- **ORB-SLAM3**: State-of-the-art visual SLAM
- **LSD-SLAM**: Direct (featureless) approach
- **DSO**: Direct Sparse Odometry

**Direct SLAM**
- Uses pixel intensities directly
- No explicit feature detection
- Better in low-texture environments

### LIDAR SLAM

Using LIDAR for mapping:

**Scan Matching Algorithms**
- **ICP** (Iterative Closest Point): Aligns consecutive scans
- **NDT** (Normal Distributions Transform): Probabilistic matching
- **LOAM**: LIDAR Odometry and Mapping

**Graph-Based SLAM**

```
Pose Graph:

   [P0]───[P1]───[P2]───[P3]
     \                    /
      \──── Loop ────────/
           Closure

Optimize poses to minimize:
- Odometry errors between consecutive poses
- Loop closure constraint errors
```

### Semantic SLAM

Adding semantic understanding:

- Label map elements (walls, doors, furniture)
- Enable semantic queries ("where is the table?")
- Improve loop closure with semantic features

## Sensor Fusion

### Why Fuse Sensors?

Different sensors have complementary strengths:

| Sensor | Strengths | Weaknesses |
|--------|-----------|------------|
| Camera | Rich appearance, cheap | No depth, lighting dependent |
| LIDAR | Accurate depth, lighting invariant | Expensive, sparse data |
| IMU | High frequency, orientation | Drift over time |
| GPS | Global position | Indoor unavailable, low accuracy |

### Fusion Approaches

**Early Fusion**
- Combine raw sensor data
- Joint feature extraction
- Example: RGB-D point cloud coloring

**Late Fusion**
- Process sensors independently
- Combine at decision level
- Example: Voting from multiple detectors

**Deep Fusion**
- Learn to combine at multiple levels
- End-to-end training
- Example: Multi-modal transformer networks

### Kalman Filter

The fundamental algorithm for sensor fusion:

```python
class KalmanFilter:
    def __init__(self, dim_x, dim_z):
        self.x = np.zeros(dim_x)     # State estimate
        self.P = np.eye(dim_x)       # State covariance
        self.Q = np.eye(dim_x)       # Process noise
        self.R = np.eye(dim_z)       # Measurement noise
        self.F = np.eye(dim_x)       # State transition
        self.H = np.zeros((dim_z, dim_x))  # Measurement matrix

    def predict(self):
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q

    def update(self, z):
        y = z - self.H @ self.x           # Innovation
        S = self.H @ self.P @ self.H.T + self.R  # Innovation covariance
        K = self.P @ self.H.T @ np.linalg.inv(S)  # Kalman gain
        self.x = self.x + K @ y
        self.P = (np.eye(len(self.x)) - K @ self.H) @ self.P
```

### Extended Kalman Filter (EKF)

For nonlinear systems:
- Linearizes around current estimate
- Uses Jacobians for state transition and measurement
- Standard for robot localization

### Particle Filters

For highly nonlinear, multi-modal distributions:
- Represent belief with weighted samples
- Handles non-Gaussian uncertainty
- Used in Monte Carlo Localization

## Pose Estimation

### 6-DoF Object Pose

Determining object position and orientation:

**Approaches:**
1. **Keypoint-based**: Detect 2D keypoints, solve PnP
2. **Dense correspondence**: Predict per-pixel coordinates
3. **Direct regression**: End-to-end pose prediction
4. **Render-and-compare**: Match against rendered templates

### Human Pose Estimation

Detecting human body configuration:

- **2D Pose**: Pixel locations of joints
- **3D Pose**: 3D joint positions
- **Body Mesh**: Full body surface reconstruction

Applications in HRI:
- Understanding human intent
- Safe human-robot interaction
- Gesture recognition

## State Estimation

### Robot State Estimation

Combining multiple sources for robot state:

```
┌─────────────────────────────────────────────────┐
│            Robot State Estimation               │
├─────────────────────────────────────────────────┤
│                                                 │
│  Joint Encoders ────┐                           │
│                     │                           │
│  IMU ───────────────┼──► State ──► Robot       │
│                     │    Estimator   State     │
│  Vision ────────────┤                           │
│                     │    (EKF, UKF,             │
│  Force Sensors ─────┘     Factor Graph)         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Contact State Estimation

Critical for manipulation and locomotion:

- **Binary contact**: Is there contact?
- **Contact location**: Where on the robot?
- **Contact force**: How much force?

## Perception for Manipulation

### Grasp Detection

Finding stable grasps for objects:

**Approaches:**
- Analytical methods based on geometry
- Data-driven grasp prediction
- Reinforcement learning for grasping

### Scene Understanding

Building actionable scene representations:

- Object poses and properties
- Support relationships
- Affordance detection (what can be done?)

## Summary

Perception systems are essential for Physical AI:

- **Vision Sensors**: RGB, depth, and event cameras
- **LIDAR**: Accurate 3D environmental sensing
- **Object Detection**: Identifying and localizing objects
- **SLAM**: Building maps while localizing
- **Sensor Fusion**: Combining multiple sensor modalities
- **State Estimation**: Tracking robot and environment state

Key challenges:
- Real-time processing requirements
- Handling uncertainty and noise
- Adapting to diverse environments
- Bridging the sim-to-real gap

## Review Questions

1. Compare structured light, ToF, and stereo depth sensing methods.
2. Explain the SLAM problem and why it's challenging.
3. What are the advantages of sensor fusion over single sensors?
4. Describe how the Kalman filter combines prediction and measurement.
5. What is the difference between semantic and instance segmentation?

## Hands-On Exercise

**Exercise 4.1: Perception Pipeline Implementation**

Build a basic perception pipeline that:

1. Captures RGB-D data from a sensor or simulation
2. Detects objects using a pre-trained model
3. Estimates object poses in 3D
4. Publishes results as ROS 2 messages

Include visualization in RViz2 showing:
- Camera image with detection overlays
- Point cloud with detected objects highlighted
- TF frames for detected object poses
