---
title: "Chapter 3: ROS 2 Fundamentals"
description: "Master the industry-standard framework for robot software development."
sidebar_position: 3
---

# ROS 2 Fundamentals

The Robot Operating System 2 (ROS 2) is the industry-standard middleware framework for building robotic systems. This chapter provides a comprehensive introduction to ROS 2, covering its architecture, core concepts, and practical usage for Physical AI development.

## Introduction to ROS 2

### What is ROS 2?

ROS 2 is not an operating system in the traditional sense, but rather a **middleware framework** that provides:

- **Communication Infrastructure**: Standardized message passing between components
- **Hardware Abstraction**: Unified interfaces for diverse robot hardware
- **Software Reusability**: Modular packages that can be shared and reused
- **Development Tools**: Visualization, debugging, and analysis utilities
- **Ecosystem**: Large community and extensive package library

### Why ROS 2 Over ROS 1?

ROS 2 was designed to address limitations of ROS 1:

| Feature | ROS 1 | ROS 2 |
|---------|-------|-------|
| Real-time Support | Limited | Built-in |
| Multi-robot | Challenging | Native support |
| Security | Minimal | DDS security |
| Embedded Systems | Difficult | Better support |
| Production Ready | Research-focused | Production-ready |

### ROS 2 Distributions

ROS 2 releases are named alphabetically:

- **Humble Hawksbill** (2022): LTS until 2027
- **Iron Irwini** (2023): Standard support
- **Jazzy Jalisco** (2024): Latest features

## Core Concepts

### Nodes

**Nodes** are the fundamental units of computation in ROS 2:

```python
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        super().__init__('minimal_node')
        self.get_logger().info('Node has been started')

def main(args=None):
    rclpy.init(args=args)
    node = MinimalNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Key Properties:**
- Single executable process
- Can contain multiple publishers, subscribers, services
- Should have a single, well-defined purpose
- Communicate with other nodes via ROS 2 interfaces

### Topics

**Topics** enable asynchronous, many-to-many communication:

```
┌─────────┐     /sensor_data    ┌─────────┐
│ Sensor  │ ──────────────────► │Processor│
│  Node   │    (Publisher)      │  Node   │
└─────────┘                     └─────────┘
     │                               │
     │                               │
     └──────────────┬────────────────┘
                    │
                    ▼
              ┌──────────┐
              │  Logger  │
              │   Node   │
              └──────────┘
```

**Publisher Example:**
```python
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello, ROS 2!'
        self.publisher_.publish(msg)
```

**Subscriber Example:**
```python
from std_msgs.msg import String

class MinimalSubscriber(Node):
    def __init__(self):
        super().__init__('minimal_subscriber')
        self.subscription = self.create_subscription(
            String,
            'topic',
            self.listener_callback,
            10)

    def listener_callback(self, msg):
        self.get_logger().info(f'Received: {msg.data}')
```

### Services

**Services** provide synchronous request-response communication:

```
┌────────┐                      ┌────────┐
│ Client │  ──── Request ────►  │ Server │
│  Node  │                      │  Node  │
│        │  ◄─── Response ────  │        │
└────────┘                      └────────┘
```

**Service Server:**
```python
from example_interfaces.srv import AddTwoInts

class AddTwoIntsServer(Node):
    def __init__(self):
        super().__init__('add_two_ints_server')
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_callback)

    def add_callback(self, request, response):
        response.sum = request.a + request.b
        return response
```

**Service Client:**
```python
class AddTwoIntsClient(Node):
    def __init__(self):
        super().__init__('add_two_ints_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')

    async def send_request(self, a, b):
        request = AddTwoInts.Request()
        request.a = a
        request.b = b
        future = self.cli.call_async(request)
        return await future
```

### Actions

**Actions** are for long-running tasks with feedback:

```
┌────────┐      Goal       ┌────────┐
│ Action │ ───────────────►│ Action │
│ Client │                 │ Server │
│        │ ◄─── Feedback ──│        │
│        │ ◄─── Result ────│        │
└────────┘                 └────────┘
```

Actions combine:
- A goal (request)
- Continuous feedback
- A final result
- Cancellation capability

### Parameters

**Parameters** allow runtime configuration of nodes:

```python
class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')
        self.declare_parameter('my_parameter', 'default_value')

        # Get parameter value
        param_value = self.get_parameter('my_parameter').value

        # Parameter callback for changes
        self.add_on_set_parameters_callback(self.param_callback)
```

## Messages and Interfaces

### Standard Message Types

ROS 2 provides common message types:

**Geometry Messages:**
- `geometry_msgs/Point`: 3D point (x, y, z)
- `geometry_msgs/Pose`: Position + orientation
- `geometry_msgs/Twist`: Linear + angular velocity
- `geometry_msgs/Transform`: Coordinate transformation

**Sensor Messages:**
- `sensor_msgs/Image`: Camera images
- `sensor_msgs/PointCloud2`: 3D point clouds
- `sensor_msgs/LaserScan`: LIDAR scans
- `sensor_msgs/Imu`: IMU data
- `sensor_msgs/JointState`: Joint positions/velocities

### Custom Message Definition

Create custom messages in `.msg` files:

```
# HumanoidState.msg
std_msgs/Header header
float64[] joint_positions
float64[] joint_velocities
geometry_msgs/Pose base_pose
bool is_balanced
```

## Package Structure

### Creating a Package

A ROS 2 package contains:

```
my_robot_package/
├── package.xml          # Package metadata
├── setup.py             # Python build info
├── setup.cfg            # Setup configuration
├── resource/            # Package marker
│   └── my_robot_package
├── my_robot_package/    # Python modules
│   ├── __init__.py
│   └── node_script.py
├── launch/              # Launch files
│   └── robot.launch.py
├── config/              # Configuration files
│   └── params.yaml
├── msg/                 # Custom messages
│   └── CustomMsg.msg
└── srv/                 # Custom services
    └── CustomSrv.srv
```

### Package.xml

Define package dependencies:

```xml
<?xml version="1.0"?>
<package format="3">
  <name>my_robot_package</name>
  <version>0.0.1</version>
  <description>My robot package</description>

  <depend>rclpy</depend>
  <depend>std_msgs</depend>
  <depend>sensor_msgs</depend>
  <depend>geometry_msgs</depend>

  <export>
    <build_type>ament_python</build_type>
  </export>
</package>
```

## Launch System

### Launch Files

Launch files orchestrate multiple nodes:

```python
# robot.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    return LaunchDescription([
        DeclareLaunchArgument(
            'robot_name',
            default_value='humanoid',
            description='Name of the robot'
        ),

        Node(
            package='my_robot_package',
            executable='sensor_node',
            name='sensor_node',
            parameters=[{'rate': 100.0}],
            remappings=[('/input', '/sensor/raw')]
        ),

        Node(
            package='my_robot_package',
            executable='control_node',
            name='control_node',
            parameters=['config/control_params.yaml']
        ),
    ])
```

## TF2: Coordinate Transforms

### Understanding TF2

TF2 manages coordinate frame transformations:

```
           world
             │
             ▼
          base_link
         /        \
        ▼          ▼
   left_arm    right_arm
       │           │
       ▼           ▼
   left_hand   right_hand
```

### Broadcasting Transforms

```python
from tf2_ros import TransformBroadcaster
from geometry_msgs.msg import TransformStamped

class FrameBroadcaster(Node):
    def __init__(self):
        super().__init__('frame_broadcaster')
        self.tf_broadcaster = TransformBroadcaster(self)
        self.timer = self.create_timer(0.1, self.broadcast_timer_callback)

    def broadcast_timer_callback(self):
        t = TransformStamped()
        t.header.stamp = self.get_clock().now().to_msg()
        t.header.frame_id = 'world'
        t.child_frame_id = 'base_link'
        t.transform.translation.x = 1.0
        t.transform.translation.y = 0.0
        t.transform.translation.z = 0.0
        t.transform.rotation.w = 1.0

        self.tf_broadcaster.sendTransform(t)
```

### Listening to Transforms

```python
from tf2_ros import Buffer, TransformListener

class FrameListener(Node):
    def __init__(self):
        super().__init__('frame_listener')
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

    def get_transform(self, target_frame, source_frame):
        try:
            transform = self.tf_buffer.lookup_transform(
                target_frame,
                source_frame,
                rclpy.time.Time())
            return transform
        except Exception as e:
            self.get_logger().error(f'Transform error: {e}')
            return None
```

## Command Line Tools

### Essential Commands

```bash
# List active nodes
ros2 node list

# Show node info
ros2 node info /node_name

# List topics
ros2 topic list

# Echo topic messages
ros2 topic echo /topic_name

# Publish to topic
ros2 topic pub /topic_name std_msgs/String "data: 'hello'"

# Call a service
ros2 service call /service_name example_interfaces/srv/AddTwoInts "{a: 1, b: 2}"

# List parameters
ros2 param list

# Get/set parameters
ros2 param get /node_name param_name
ros2 param set /node_name param_name value

# Launch a file
ros2 launch package_name launch_file.py
```

## Quality of Service (QoS)

### QoS Profiles

QoS settings control communication reliability:

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

sensor_qos = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    history=HistoryPolicy.KEEP_LAST,
    depth=10
)

command_qos = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    history=HistoryPolicy.KEEP_LAST,
    depth=1
)
```

### Common QoS Configurations

| Use Case | Reliability | History | Durability |
|----------|-------------|---------|------------|
| Sensor data | Best Effort | Keep Last | Volatile |
| Commands | Reliable | Keep Last | Volatile |
| Configuration | Reliable | Keep Last | Transient Local |

## Visualization with RViz2

### Using RViz2

RViz2 visualizes robot state and sensor data:

- **Robot Model**: URDF visualization
- **TF Frames**: Coordinate frame display
- **Point Clouds**: LIDAR and depth data
- **Images**: Camera feeds
- **Markers**: Custom visualizations
- **Paths**: Navigation trajectories

## Simulation Integration

### Gazebo Integration

ROS 2 integrates with Gazebo simulator:

```xml
<!-- robot.urdf with Gazebo plugins -->
<gazebo>
  <plugin name="joint_state_publisher"
          filename="libgazebo_ros_joint_state_publisher.so">
    <joint_name>joint1</joint_name>
    <joint_name>joint2</joint_name>
  </plugin>
</gazebo>
```

### Isaac Sim Integration

NVIDIA Isaac Sim also supports ROS 2:

- Native ROS 2 bridge
- High-fidelity physics
- Synthetic data generation
- GPU-accelerated simulation

## Best Practices

### Node Design

- **Single Responsibility**: One purpose per node
- **Configurable**: Use parameters for settings
- **Documented**: Clear API documentation
- **Tested**: Unit and integration tests

### Topic Naming

Follow conventions:
- Use lowercase with underscores
- Prefix with namespace when appropriate
- Use standard suffixes (e.g., `/image_raw`, `/cmd_vel`)

### Error Handling

```python
class RobustNode(Node):
    def __init__(self):
        super().__init__('robust_node')

    def safe_operation(self):
        try:
            # Risky operation
            result = self.perform_task()
            return result
        except Exception as e:
            self.get_logger().error(f'Operation failed: {e}')
            return None
```

## Summary

ROS 2 provides the foundation for developing Physical AI systems:

- **Nodes**: Modular computational units
- **Topics**: Asynchronous pub/sub communication
- **Services**: Synchronous request/response
- **Actions**: Long-running tasks with feedback
- **TF2**: Coordinate frame management
- **Launch**: Multi-node orchestration

Key benefits for Physical AI:
- Real-time capable architecture
- Extensive sensor and actuator support
- Rich ecosystem of packages
- Strong simulation integration

## Review Questions

1. Explain the difference between topics, services, and actions.
2. When would you use BEST_EFFORT vs RELIABLE QoS?
3. How does TF2 help in managing coordinate frames?
4. What are the key components of a ROS 2 package?
5. Describe the role of launch files in a robotics application.

## Hands-On Exercise

**Exercise 3.1: Simple Robot Controller**

Create a ROS 2 package that:

1. Subscribes to `/sensor_data` (simulated sensor readings)
2. Publishes control commands to `/cmd_vel`
3. Implements a simple proportional controller
4. Uses parameters for controller gains
5. Includes a launch file to start all components

Test your controller with a simulated robot or mock data publisher.
