import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SAYEM_FACE_LANDMARKS,
  buildFaceIdentityModel,
  evaluateFaceSurfacePoint,
} from './faceMeshBuilder';

describe('faceMeshBuilder', () => {
  it('constructs a multi-part continuous 3D facial model with valid normals and positive surface geometry', () => {
    const model = buildFaceIdentityModel();

    assert.equal(model.parts.length, 5);
    assert.deepEqual(
      model.parts.map((p) => p.name),
      ['craniumAndFace', 'leftEye', 'rightEye', 'hairLocks', 'collarAndShoulders'],
    );
    assert.ok(model.metrics.totalTriangles > 12000, 'Expected high-resolution continuous facial mesh');
    assert.ok(model.metrics.totalVertices > 7000);

    for (const part of model.parts) {
      assert.equal(part.positions.length, part.normals.length);
      for (let i = 0; i < part.normals.length; i += 3) {
        const len = Math.hypot(part.normals[i], part.normals[i + 1], part.normals[i + 2]);
        assert.ok(Number.isFinite(len) && Math.abs(len - 1) < 1e-3, 'Vertex normals must be unit length');
      }
      for (let i = 0; i < part.indices.length; i++) {
        assert.ok(part.indices[i] < part.positions.length / 3);
      }
    }
  });

  it('preserves youthful facial proportions, recessed sockets, nose depth, and soft rounded jaw', () => {
    const model = buildFaceIdentityModel();
    const { interpupillaryDistance, faceWidthAtCheeks, noseTipProtrusionZ, chinY, crownY } =
      model.metrics;

    // Interpupillary distance should sit naturally around ~45–70% of cheek width
    const ipdToCheekRatio = interpupillaryDistance / faceWidthAtCheeks;
    assert.ok(ipdToCheekRatio > 0.55 && ipdToCheekRatio < 0.78);
    assert.ok(crownY > 0.5 && chinY < -0.4);
    assert.ok(noseTipProtrusionZ > 0.32);

    // Verify 3D surface relief: nose tip protrudes forward of eye socket recess, cheek, and neck
    const noseTip = evaluateFaceSurfacePoint(0.0, 0.563); // y ~ -0.088
    const leftSocket = evaluateFaceSurfacePoint(-0.46, 0.459); // near left eye socket
    const templeEdge = evaluateFaceSurfacePoint(1.25, 0.46);
    const neckBase = evaluateFaceSurfacePoint(0.0, 0.96);

    assert.ok(noseTip.z > leftSocket.z, 'Nose tip must project forward of recessed eye socket');
    assert.ok(noseTip.z > templeEdge.z, 'Nose tip must project forward of lateral temples');
    assert.ok(noseTip.z > neckBase.z, 'Nose tip must project forward of lower neck');
    assert.ok(SAYEM_FACE_LANDMARKS.length >= 25);
  });

  it('keeps hair silhouette medium-short above shoulders and distinct from facial skin', () => {
    const model = buildFaceIdentityModel();
    const hairPart = model.parts.find((p) => p.name === 'hairLocks')!;

    let minHairY = Infinity;
    let maxHairY = -Infinity;
    for (let i = 1; i < hairPart.positions.length; i += 3) {
      const y = hairPart.positions[i];
      if (y < minHairY) minHairY = y;
      if (y > maxHairY) maxHairY = y;
    }

    assert.ok(maxHairY > 0.60, 'Hair crown should have natural tousled volume');
    assert.ok(minHairY > -0.10, 'Medium-short hair must stay above jawline/shoulders');
  });
});
