"""Save the exact corrected runtime as an editable, baked Blender master.
No re-export is performed: Blender may reinterpret custom PBR nodes on export.
Usage: blender -b --python save-web-master.py -- MODEL.glb OUTPUT.blend REFERENCE.png
"""
import bpy, hashlib, sys
from pathlib import Path
args=sys.argv[sys.argv.index('--')+1:]
source,output,reference=map(Path,args)
if output.exists():raise FileExistsError('Never overwrite an existing master')
if hashlib.sha256(reference.read_bytes()).hexdigest()!='0240be0cfe3689cc01f4c90e70b338918889a9246862f2b4edb6d189e5243cfe':raise ValueError('Canonical reference differs')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
scene=bpy.context.scene
scene['runtime_sha256']=hashlib.sha256(source.read_bytes()).hexdigest()
scene['scope']='Inferred and manually repaired native reconstruction, not an original authored or pixel-exact mesh.'
scene['eye_revision']='V7: recessed eye assembly, flattened depth, reduced outward cant, subdued sclera; original rig and animation retained.'
image=bpy.data.images.load(str(reference));image.pack();image.use_fake_user=True
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(output))
print('BORO_MASTER_SAVED',output,scene['runtime_sha256'])
