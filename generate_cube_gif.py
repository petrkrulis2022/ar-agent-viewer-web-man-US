#!/usr/bin/env python3
"""
Generate a rotating 3D cube GIF with 6 different colored faces
representing the CubePay payment methods
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib import animation
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from PIL import Image
import io

# Payment method configurations (matching your CubePaymentEngine)
PAYMENT_METHODS = {
    'crypto_qr': {'color': '#00ff00', 'icon': '📱', 'name': 'Crypto QR'},
    'virtual_card': {'color': '#0080ff', 'icon': '💳', 'name': 'Virtual Card'},
    'bank_qr': {'color': '#004080', 'icon': '🔲', 'name': 'Bank QR'},
    'voice_pay': {'color': '#8000ff', 'icon': '🎤', 'name': 'Voice Pay'},
    'sound_pay': {'color': '#ff8000', 'icon': '🎵', 'name': 'Sound Pay'},
    'onboard': {'color': '#ffff00', 'icon': '🚀', 'name': 'On/Off Ramp'},
}

def create_cube_vertices():
    """Create vertices for a cube centered at origin"""
    return np.array([
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],  # Back face
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]       # Front face
    ])

def get_cube_faces(vertices):
    """Define the 6 faces of the cube"""
    return [
        [vertices[4], vertices[5], vertices[6], vertices[7]],  # Front (z=1)
        [vertices[0], vertices[1], vertices[2], vertices[3]],  # Back (z=-1)
        [vertices[1], vertices[5], vertices[6], vertices[2]],  # Right (x=1)
        [vertices[0], vertices[4], vertices[7], vertices[3]],  # Left (x=-1)
        [vertices[3], vertices[2], vertices[6], vertices[7]],  # Top (y=1)
        [vertices[0], vertices[1], vertices[5], vertices[4]],  # Bottom (y=-1)
    ]

def rotation_matrix_x(angle):
    """Create rotation matrix around X axis"""
    c, s = np.cos(angle), np.sin(angle)
    return np.array([
        [1, 0, 0],
        [0, c, -s],
        [0, s, c]
    ])

def rotation_matrix_y(angle):
    """Create rotation matrix around Y axis"""
    c, s = np.cos(angle), np.sin(angle)
    return np.array([
        [c, 0, s],
        [0, 1, 0],
        [-s, 0, c]
    ])

def rotation_matrix_z(angle):
    """Create rotation matrix around Z axis"""
    c, s = np.cos(angle), np.sin(angle)
    return np.array([
        [c, -s, 0],
        [s, c, 0],
        [0, 0, 1]
    ])

def rotate_vertices(vertices, angle_x, angle_y, angle_z):
    """Apply rotation to vertices"""
    rot_x = rotation_matrix_x(angle_x)
    rot_y = rotation_matrix_y(angle_y)
    rot_z = rotation_matrix_z(angle_z)
    
    # Combined rotation
    rot = rot_z @ rot_y @ rot_x
    
    return np.dot(vertices, rot.T)

def create_frame(angle, face_colors, face_labels):
    """Create a single frame of the rotating cube"""
    # Use a color that matches the main page background (slate-900)
    bg_color = '#0f172a'  # slate-900 color from Tailwind
    fig = plt.figure(figsize=(4, 4), facecolor=bg_color)
    ax = fig.add_subplot(111, projection='3d', facecolor=bg_color)
    
    # Create and rotate vertices
    vertices = create_cube_vertices()
    rotated = rotate_vertices(vertices, angle * 0.3, angle, angle * 0.5)
    
    # Get faces
    faces = get_cube_faces(rotated)
    
    # Create face collection - ALL GREEN, NO TEXT
    face_collection = Poly3DCollection(
        faces,
        facecolors='#00ff00',  # All faces green
        edgecolors='#00dd00',  # Lighter green edges
        linewidths=2,
        alpha=0.95
    )
    
    ax.add_collection3d(face_collection)
    
    # NO TEXT - Simple clean cube only
    
    # Set axis properties with fixed limits for consistent size
    ax.set_xlim([-1.5, 1.5])
    ax.set_ylim([-1.5, 1.5])
    ax.set_zlim([-1.5, 1.5])
    ax.set_box_aspect([1,1,1])
    
    # Completely hide all axis elements
    ax.set_axis_off()
    ax.grid(False)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_zticks([])
    
    # Completely hide all axis elements
    ax.set_axis_off()
    ax.grid(False)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_zticks([])
    
    # Remove all panes and spines
    ax.xaxis.pane.fill = False
    ax.yaxis.pane.fill = False
    ax.zaxis.pane.fill = False
    ax.xaxis.pane.set_edgecolor('none')
    ax.yaxis.pane.set_edgecolor('none')
    ax.zaxis.pane.set_edgecolor('none')
    ax.xaxis.line.set_color((1.0, 1.0, 1.0, 0.0))
    ax.yaxis.line.set_color((1.0, 1.0, 1.0, 0.0))
    ax.zaxis.line.set_color((1.0, 1.0, 1.0, 0.0))
    
    # Convert to image
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight', 
                facecolor=bg_color, edgecolor='none', pad_inches=0)
    buf.seek(0)
    img = Image.open(buf)
    plt.close(fig)
    
    return img

def generate_rotating_cube_gif(output_path='cubepay_rotating_cube.gif', 
                                 num_frames=120, duration=80):
    """Generate the rotating cube GIF"""
    print("🎬 Generating rotating cube GIF...")
    
    # Setup face colors and labels based on payment methods
    methods = list(PAYMENT_METHODS.values())
    face_colors = [m['color'] for m in methods]
    face_labels = [{'icon': m['icon'], 'name': m['name']} for m in methods]
    
    # Generate frames
    frames = []
    angles = np.linspace(0, 2 * np.pi, num_frames)
    
    for i, angle in enumerate(angles):
        print(f"📸 Generating frame {i+1}/{num_frames}...", end='\r')
        frame = create_frame(angle, face_colors, face_labels)
        frames.append(frame)
    
    print(f"\n💾 Saving GIF to {output_path}...")
    
    # Save as GIF
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        optimize=True
    )
    
    print(f"✅ Successfully created {output_path}")
    print(f"📊 Total frames: {num_frames}")
    print(f"⏱️  Duration per frame: {duration}ms")
    print(f"🔄 Total animation time: {(num_frames * duration) / 1000:.1f}s")

if __name__ == '__main__':
    # Generate the GIF with slower, smoother rotation
    generate_rotating_cube_gif(
        output_path='cubepay_rotating_cube.gif',
        num_frames=120,  # More frames for smoother rotation
        duration=80     # 80ms per frame = slower rotation
    )
