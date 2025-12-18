---
title: "Chapter 5: Motion Planning & Control"
description: "Learn how humanoid robots plan, balance, and move safely."
sidebar_position: 5
---

# Motion Planning & Control

Motion planning and control are at the heart of Physical AI, determining how robots move through the world safely and efficiently. This chapter covers the algorithms and techniques that enable humanoid robots to plan paths, maintain balance, and execute complex movements.

## Introduction to Motion Planning

### The Motion Planning Problem

Given:
- **Start configuration**: Current robot state
- **Goal configuration**: Desired robot state
- **Obstacles**: Things to avoid
- **Constraints**: Physical limitations

Find:
- A **collision-free path** from start to goal
- That respects robot constraints
- Optimized for some criteria (time, energy, smoothness)

### Configuration Space

Motion planning operates in **configuration space (C-space)**:

```
┌─────────────────────────────────────────────────┐
│           Configuration Space                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  Workspace: 3D physical space                   │
│                                                  │
│  C-space: Space of all robot configurations     │
│           Dimension = number of DoF             │
│                                                  │
│  C-free: Collision-free configurations          │
│  C-obs: Configurations in collision             │
│                                                  │
│  A 7-DoF arm has a 7-dimensional C-space        │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Path Planning Algorithms

### Grid-Based Methods

**A* Algorithm**

Classic graph search with heuristics:

```python
def astar(start, goal, graph, heuristic):
    open_set = PriorityQueue()
    open_set.put((0, start))
    came_from = {}
    g_score = {start: 0}

    while not open_set.empty():
        _, current = open_set.get()

        if current == goal:
            return reconstruct_path(came_from, current)

        for neighbor in graph.neighbors(current):
            tentative_g = g_score[current] + graph.cost(current, neighbor)

            if tentative_g < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + heuristic(neighbor, goal)
                open_set.put((f_score, neighbor))

    return None  # No path found
```

**Properties:**
- Complete: Always finds a path if one exists
- Optimal: Finds shortest path with admissible heuristic
- Complexity: Exponential in path length

### Sampling-Based Methods

For high-dimensional spaces, sampling methods are practical:

**Rapidly-exploring Random Trees (RRT)**

```
Algorithm RRT:
1. Initialize tree T with start configuration
2. While goal not reached:
   a. Sample random configuration q_rand
   b. Find nearest node q_near in T
   c. Extend from q_near toward q_rand to get q_new
   d. If path q_near → q_new is collision-free:
      Add q_new to T with edge from q_near
3. Return path from start to goal
```

**RRT Properties:**
- Probabilistically complete
- Explores space efficiently
- May produce suboptimal paths

**RRT* (Optimal RRT)**

Improves path quality through rewiring:

```python
def rrt_star(start, goal, space, max_iterations):
    tree = Tree()
    tree.add_node(start, parent=None, cost=0)

    for i in range(max_iterations):
        # Sample random point
        q_rand = space.sample()

        # Find nearest node
        q_near = tree.nearest(q_rand)

        # Steer toward random point
        q_new = steer(q_near, q_rand)

        if space.collision_free(q_near, q_new):
            # Find nearby nodes for rewiring
            near_nodes = tree.near(q_new, radius)

            # Choose best parent
            q_min = q_near
            c_min = tree.cost(q_near) + distance(q_near, q_new)

            for q_near_i in near_nodes:
                c_new = tree.cost(q_near_i) + distance(q_near_i, q_new)
                if c_new < c_min and space.collision_free(q_near_i, q_new):
                    q_min = q_near_i
                    c_min = c_new

            # Add new node
            tree.add_node(q_new, parent=q_min, cost=c_min)

            # Rewire nearby nodes
            for q_near_i in near_nodes:
                c_new = c_min + distance(q_new, q_near_i)
                if c_new < tree.cost(q_near_i):
                    if space.collision_free(q_new, q_near_i):
                        tree.rewire(q_near_i, parent=q_new, cost=c_new)

    return tree.path_to_goal(goal)
```

### Probabilistic Roadmaps (PRM)

Two-phase approach:

**Phase 1: Roadmap Construction**
1. Sample n random configurations
2. Connect nearby configurations with collision-free edges
3. Result: Graph representing free space

**Phase 2: Query**
1. Connect start and goal to roadmap
2. Search for path in roadmap graph
3. Return path if found

**Best for:**
- Multiple queries in same environment
- Complex, cluttered spaces

## Trajectory Optimization

### From Path to Trajectory

A **path** is purely geometric; a **trajectory** includes timing:

- Path: q(s), s ∈ [0, 1]
- Trajectory: q(t), t ∈ [0, T]

### Trajectory Optimization Formulation

```
minimize    ∫ L(q(t), q̇(t), q̈(t)) dt
   q(t)

subject to  q(0) = q_start
            q(T) = q_goal
            q̇(t) ∈ velocity limits
            q̈(t) ∈ acceleration limits
            collision_free(q(t)) ∀t
```

Common cost functions:
- **Minimum time**: L = 1
- **Minimum energy**: L = τᵀτ (torques squared)
- **Minimum jerk**: L = q⃛ᵀq⃛ (third derivative)

### Numerical Optimization Methods

**Direct Transcription**
- Discretize trajectory into waypoints
- Convert to nonlinear program (NLP)
- Solve with NLP solvers (IPOPT, SNOPT)

**Differential Dynamic Programming (DDP)**
- Second-order method
- Iteratively improves trajectory
- Good for dynamic systems

**CHOMP and STOMP**
- Covariant Hamiltonian Optimization
- Stochastic Trajectory Optimization
- Handle complex cost functions

## Humanoid Balance Control

### The Balance Problem

Humanoids must actively maintain balance:

- **Static Balance**: CoM over support polygon
- **Dynamic Balance**: Zero Moment Point (ZMP) in support
- **Push Recovery**: Responding to disturbances

### Zero Moment Point (ZMP)

The ZMP is where the total moment of inertia and gravity forces is zero:

```
ZMP condition for stability:
The ZMP must remain within the support polygon

Support Polygon:
┌─────────────────────────┐
│                         │
│    ┌─────────────┐      │
│    │  Left Foot  │      │
│    └─────────────┘      │
│           ZMP •         │
│    ┌─────────────┐      │
│    │  Right Foot │      │
│    └─────────────┘      │
│                         │
└─────────────────────────┘
```

### Linear Inverted Pendulum Model (LIPM)

Simplified model for walking:

**Assumptions:**
- Mass concentrated at Center of Mass (CoM)
- CoM moves at constant height
- No angular momentum

**Dynamics:**
```
CoM acceleration = (g/z_c) × (CoM position - ZMP position)

Where:
- g: gravity
- z_c: CoM height
- This is an unstable second-order system
```

### Capture Point Dynamics

The **Capture Point (CP)** is where the robot must step to stop:

```
CP = CoM + CoM_velocity / ω

Where ω = √(g/z_c)

If the robot places its foot at the CP, it can come to rest.
```

**Divergent Component of Motion (DCM)**:
Modern extension of capture point theory for more complex scenarios.

## Walking Pattern Generation

### Footstep Planning

Determining where to place feet:

```
┌─────────────────────────────────────────────────┐
│           Footstep Planning                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  Input: Start pose, goal pose, obstacles        │
│                                                  │
│  Output: Sequence of footstep locations         │
│                                                  │
│     ┌──┐                                        │
│     │L1│                                        │
│     └──┘  ┌──┐                                  │
│           │R1│                                  │
│     ┌──┐  └──┘                                  │
│     │L2│       ┌──┐                             │
│     └──┘       │R2│                             │
│           ┌──┐ └──┘                             │
│           │L3│                                  │
│           └──┘  ┌──┐                            │
│                 │R3│ Goal                       │
│                 └──┘                            │
└─────────────────────────────────────────────────┘
```

### Center of Mass Trajectory

Once footsteps are planned, generate CoM trajectory:

**Preview Control**:
- Use future footstep locations
- Plan CoM trajectory to keep ZMP stable
- MPC-based approaches common

**CoM Trajectory Requirements:**
- ZMP stays in support polygon
- Smooth transitions between support phases
- Respect velocity/acceleration limits

### Swing Leg Trajectory

Moving the non-support leg:

- **Ground clearance**: Avoid obstacles
- **Smooth motion**: Minimize vibrations
- **Landing preparation**: Appropriate velocity at contact

Typically polynomial (cubic, quintic) or spline trajectories.

## Whole-Body Control

### Task-Space Control

Control in Cartesian space rather than joint space:

```
Task: Control end-effector position x ∈ ℝ³
Joint configuration: q ∈ ℝⁿ

Forward kinematics: x = f(q)
Jacobian: J = ∂f/∂q

Velocity mapping: ẋ = J(q)q̇
```

**Resolved Rate Control:**
```
q̇ = J⁺ẋ_desired

Where J⁺ is the pseudoinverse of J
```

### Hierarchical Task Control

Managing multiple tasks with priorities:

```
Priority Stack:
1. Safety constraints (highest)
2. Balance maintenance
3. End-effector task
4. Posture optimization (lowest)

Lower priority tasks operate in null space of higher priorities.
```

**Null Space Projection:**
```python
def hierarchical_control(tasks, jacobians, q):
    q_dot = np.zeros(n_joints)
    N = np.eye(n_joints)  # Null space projector

    for task, J in zip(tasks, jacobians):
        # Project task into available null space
        J_proj = J @ N

        # Compute task contribution
        q_dot += np.linalg.pinv(J_proj) @ (task - J @ q_dot)

        # Update null space for next level
        N = N - np.linalg.pinv(J_proj) @ J_proj

    return q_dot
```

### Optimization-Based Control

Modern whole-body control uses QP optimization:

```
minimize    ||J_task q̇ - ẋ_desired||² + regularization terms
  q̇, τ

subject to  Dynamics: M(q)q̈ + h(q,q̇) = Sτ + Jᶜᵀf_c
            Joint limits: q_min ≤ q ≤ q_max
            Torque limits: τ_min ≤ τ ≤ τ_max
            Contact constraints
            Friction cone constraints
```

## Impedance and Compliance Control

### Impedance Control

Make robot behave like a spring-damper system:

```
Desired behavior:
F = K(x_d - x) + D(ẋ_d - ẋ)

Where:
- K: Stiffness matrix
- D: Damping matrix
- x_d: Desired position
- x: Actual position
```

**Benefits:**
- Safe interaction with environment
- Robust to position errors
- Natural compliance for contact tasks

### Variable Impedance

Adjusting stiffness based on task:

- **High stiffness**: Precise positioning
- **Low stiffness**: Safe contact, compliant motion
- **Adaptive**: Learn appropriate impedance

## Model Predictive Control (MPC)

### MPC Framework

Optimize over a rolling horizon:

```
At each time step:
1. Measure current state x(t)
2. Solve optimization over horizon [t, t+T]:
   minimize Σ L(x_k, u_k) + V(x_N)
   subject to dynamics, constraints
3. Apply first control u(t)
4. Repeat at next time step
```

### MPC for Locomotion

**Centroidal MPC:**
- Control center of mass and angular momentum
- Optimize contact forces
- Runs at ~100-500 Hz

**Full-Body MPC:**
- Control all joints
- More accurate but computationally expensive
- Emerging with faster solvers

## Safety and Constraint Handling

### Collision Avoidance

Real-time collision checking:

```python
def check_collision(robot_state, obstacles):
    # Get robot geometry at current state
    robot_geometry = robot.get_collision_geometry(robot_state)

    # Check against all obstacles
    for obstacle in obstacles:
        if gjk_collision_check(robot_geometry, obstacle):
            return True  # Collision detected

    return False  # No collision
```

### Safety Constraints in Control

Embedding safety in the control loop:

**Control Barrier Functions (CBFs):**
Ensure safety set is forward invariant

**Velocity/Force Limiting:**
```python
def safe_command(desired_cmd, limits):
    # Clip to joint velocity limits
    safe_vel = np.clip(desired_cmd.velocity,
                       limits.vel_min, limits.vel_max)

    # Clip to joint torque limits
    safe_torque = np.clip(desired_cmd.torque,
                          limits.torque_min, limits.torque_max)

    return SafeCommand(safe_vel, safe_torque)
```

## Summary

Motion planning and control enable humanoid robots to move effectively:

- **Path Planning**: Finding collision-free paths (RRT, PRM, A*)
- **Trajectory Optimization**: Smooth, optimal motion
- **Balance Control**: Maintaining stability (ZMP, Capture Point)
- **Walking Generation**: Footsteps and CoM trajectories
- **Whole-Body Control**: Coordinating all degrees of freedom
- **Safety**: Ensuring safe operation at all times

Modern approaches increasingly use:
- Optimization-based methods
- Model Predictive Control
- Learning-based components

## Review Questions

1. Explain the difference between C-space and workspace.
2. Compare RRT and PRM planning algorithms.
3. What is the Zero Moment Point and why is it important?
4. Describe the hierarchical task control approach.
5. How does Model Predictive Control work for locomotion?

## Hands-On Exercise

**Exercise 5.1: Motion Planning Implementation**

Implement a simple motion planner:

1. Create a 2D environment with obstacles
2. Implement RRT algorithm
3. Implement RRT* for path optimization
4. Visualize the exploration tree and final path
5. Compare path quality and computation time

Extensions:
- Add dynamics constraints
- Implement trajectory smoothing
- Add real-time replanning capability
