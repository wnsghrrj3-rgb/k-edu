"""케이월드 장면 그림 — 블렌더로 직접 만드는 모델의 공통 도구(2026-11-17).
실행: blender -b --python kworld/tools/blender/make_<묶음>.py   → kworld/scene/assets/<묶음>.glb
그림체: 면이 또렷한 저폴리 + 모서리 둥글림 + 꼭짓점 색 음영(아래가 어둡고, 아래를 보는 면이 어둡고, 면마다 아주 조금 다름).
좌표: 블렌더 z 위 · 앞은 -y. 내보낼 때 y 위로 바뀐다(three: 앞 = +z).
재질 이름이 약속이다 — kit.js 가 이름으로 색을 입힌다(tint_* 는 장면이 색을 정함)."""
import bpy, bmesh, math, random, os
from mathutils import Vector, Matrix

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'scene', 'assets'))
RND = random.Random(7)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATS.clear()


def lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgb(hexv):
    return (lin((hexv >> 16) & 255), lin((hexv >> 8) & 255), lin(hexv & 255))


MATS = {}


def mat(name, hexv=0xffffff, rough=0.85, metal=0.0, emit=None):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*rgb(hexv), 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit is not None:
        for key in ('Emission Color', 'Emission'):
            if key in b.inputs:
                b.inputs[key].default_value = (*rgb(emit), 1)
                break
        if 'Emission Strength' in b.inputs:
            b.inputs['Emission Strength'].default_value = 1.0
    MATS[name] = m
    return m


class B:
    """모양을 하나씩 얹어 한 물체로 만든다. 얹을 때마다 재질 이름과 밝기(tone)를 준다."""

    def __init__(self):
        self.bm = bmesh.new()
        self.mats = []
        self.tone = self.bm.faces.layers.float.new('tone')
        self.jit = self.bm.faces.layers.float.new('jit')

    def _mi(self, name):
        if name not in self.mats:
            self.mats.append(name)
        return self.mats.index(name)

    def _take(self, tmp, m, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), f=None, tone=1.0, jit=0.05, bevel=0, bseg=1):
        if bevel > 0:
            bmesh.ops.bevel(tmp, geom=list(tmp.edges), offset=bevel, segments=bseg, affect='EDGES', profile=0.5)
        M = Matrix.Translation(Vector(loc)) @ Matrix.Rotation(rot[2], 4, 'Z') @ Matrix.Rotation(rot[1], 4, 'Y') @ Matrix.Rotation(rot[0], 4, 'X')
        S = Matrix.Diagonal((scale[0], scale[1], scale[2], 1))
        for v in tmp.verts:
            if f:
                v.co = Vector(f(v.co.copy()))
            v.co = M @ (S @ v.co)
        bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
        me = bpy.data.meshes.new('tmp')
        tmp.to_mesh(me)
        tmp.free()
        n0 = len(self.bm.faces)
        self.bm.from_mesh(me)
        bpy.data.meshes.remove(me)
        self.bm.faces.ensure_lookup_table()
        mi = self._mi(m)
        for i in range(n0, len(self.bm.faces)):
            fc = self.bm.faces[i]
            fc.material_index = mi
            fc[self.tone] = tone
            fc[self.jit] = jit
        return self

    def box(self, size, loc, m, **k):
        t = bmesh.new()
        bmesh.ops.create_cube(t, size=1)
        for v in t.verts:
            v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
        return self._take(t, m, loc, **k)

    def cone(self, r1, r2, h, loc, m, seg=8, cap=True, **k):
        """r1 = 아래 반지름, r2 = 위 반지름, 가운데가 loc"""
        t = bmesh.new()
        bmesh.ops.create_cone(t, cap_ends=cap, cap_tris=False, segments=seg, radius1=max(r1, 1e-4), radius2=max(r2, 1e-4), depth=h)
        return self._take(t, m, loc, **k)

    def ball(self, r, loc, m, sub=2, **k):
        t = bmesh.new()
        bmesh.ops.create_icosphere(t, subdivisions=sub, radius=r)
        return self._take(t, m, loc, **k)

    def lathe(self, prof, loc, m, seg=10, cap=True, **k):
        """prof = [(반지름, 높이), …] 아래에서 위로. 돌려 만든 모양(항아리·솥·기둥)."""
        t = bmesh.new()
        rings = []
        for r, z in prof:
            rings.append([t.verts.new((math.cos(a) * r, math.sin(a) * r, z)) for a in [i * 2 * math.pi / seg for i in range(seg)]])
        for a, b in zip(rings, rings[1:]):
            for i in range(seg):
                t.faces.new((a[i], a[(i + 1) % seg], b[(i + 1) % seg], b[i]))
        if cap:
            t.faces.new(list(reversed(rings[0])))
            t.faces.new(rings[-1])
        return self._take(t, m, loc, **k)

    def prism(self, pts, depth, loc, m, **k):
        """pts = xz 평면의 다각형(반시계), y 로 depth 만큼 두께. 지붕·박공."""
        t = bmesh.new()
        a = [t.verts.new((x, -depth / 2, z)) for x, z in pts]
        b = [t.verts.new((x, depth / 2, z)) for x, z in pts]
        n = len(pts)
        t.faces.new(a)
        t.faces.new(list(reversed(b)))
        for i in range(n):
            t.faces.new((a[i], b[i], b[(i + 1) % n], a[(i + 1) % n]))
        return self._take(t, m, loc, **k)

    def grid(self, nx, ny, fn, m, loc=(0, 0, 0), **k):
        """fn(u, v) → (x, y, z), u·v 는 0~1. 휘어진 면(처마·돛·천)."""
        t = bmesh.new()
        vs = [[t.verts.new(fn(i / nx, j / ny)) for j in range(ny + 1)] for i in range(nx + 1)]
        for i in range(nx):
            for j in range(ny):
                t.faces.new((vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1]))
        return self._take(t, m, loc, **k)

    def done(self, name, origin=(0, 0, 0), smooth=40, shade=(0.72, 1.06), under=0.2, parent=None):
        """꼭짓점 색 음영을 칠하고 물체로 만든다. origin = 돌림 중심(그 자리로 물체를 옮긴다)."""
        bm = self.bm
        bm.normal_update()
        me = bpy.data.meshes.new(name)
        zs = [v.co.z for v in bm.verts] or [0]
        z0, z1 = min(zs), max(zs)
        col = bm.loops.layers.color.new('Col')
        rr = random.Random(hash(name) & 0xffff)
        for fc in bm.faces:
            j = 1 + (rr.random() - 0.5) * 2 * fc[self.jit]
            dn = max(0.0, -fc.normal.z)
            for lp in fc.loops:
                h = (lp.vert.co.z - z0) / ((z1 - z0) or 1)
                g = (shade[0] + (shade[1] - shade[0]) * h) * (1 - under * dn) * fc[self.tone] * j
                g = max(0.0, min(1.0, g))
                lp[col] = (g, g, g, 1)
        for v in bm.verts:
            v.co -= Vector(origin)
        bm.to_mesh(me)
        bm.free()
        for n in self.mats:
            me.materials.append(MATS[n])
        for p in me.polygons:
            p.use_smooth = smooth > 0
        if smooth > 0 and hasattr(me, 'set_sharp_from_angle'):
            me.set_sharp_from_angle(angle=math.radians(smooth))
        ob = bpy.data.objects.new(name, me)
        ob.location = origin
        bpy.context.scene.collection.objects.link(ob)
        if parent is not None:
            ob.parent = parent
        return ob


def export(fname):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, fname)
    for o in bpy.context.scene.objects:
        o.select_set(True)
        for a in o.data.color_attributes if o.type == 'MESH' else []:
            o.data.color_attributes.active_color = a
            try:
                o.data.color_attributes.render_color_index = 0
            except Exception:
                pass
    kw = dict(filepath=path, export_format='GLB', export_yup=True, export_apply=True, export_normals=True, export_texcoords=False, export_animations=False, export_cameras=False, export_lights=False)
    try:
        bpy.ops.export_scene.gltf(export_vertex_color='ACTIVE', export_all_vertex_colors=False, **kw)
    except TypeError:
        bpy.ops.export_scene.gltf(export_colors=True, **kw)
    n = sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == 'MESH')
    print('EXPORTED', path, 'objects', len(bpy.context.scene.objects), 'faces', n, 'bytes', os.path.getsize(path))
