import * as THREE from 'three';
import { PROCESS_MODE_VECTOR } from '../../constants';

export class ViewPathRenderer {
    render(viewPaths, size) {
        const objs = this._generateViewPathObjs(viewPaths);
        const background = this._generateBackground(viewPaths, size);

        const g = new THREE.Group();
        g.add(background);
        g.add(objs);

        return g;
    }

    _generateSvgViewPathObj(viewPath) {
        const { targetDepth, data, positionX, positionY } = viewPath;
        const shapePath = new THREE.ShapePath();
        for (let i = 0; i < data.length; i++) {
            const path = data[i];
            shapePath.moveTo(path[0].x, path[0].y);
            for (let j = 1; j < path.length; j++) {
                shapePath.lineTo(path[j].x, path[j].y);
            }
        }

        const mesh = this._generateMesh(shapePath.toShapes(), targetDepth);
        mesh.position.x = positionX;
        mesh.position.y = positionY;
        mesh.position.z = -targetDepth;

        return mesh;
    }

    _generateViewPathObj(viewPath) {
        const { isRotate, diameter, width, height, data } = viewPath;

        let geometry = null;
        if (isRotate) {
            geometry = new THREE.CylinderBufferGeometry(diameter / 2, diameter / 2, height, data[0].length - 1, data.length - 1);
        } else {
            geometry = new THREE.PlaneBufferGeometry(width, height, data[0].length - 1, data.length - 1);
        }
        const positions = geometry.attributes.position.array;

        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                const index = (i * data[i].length + j) * 3;
                positions[index] = data[i][j].x;
                positions[index + 2] = data[i][j].y;
            }
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: '#fee5c6' }));

        if (viewPath.positionX) {
            mesh.position.x = viewPath.positionX;
        }
        if (viewPath.positionY) {
            mesh.position.y = viewPath.positionY;
        }
        if (viewPath.rotationB) {
            mesh.rotation.y = viewPath.rotationB / 180 * Math.PI;
        }

        return mesh;
    }

    _generateViewPathObjs(viewPaths) {
        const group = new THREE.Group();
        for (const viewPath of viewPaths.data) {
            const { mode, boundingBox } = viewPath;
            const mesh = mode === PROCESS_MODE_VECTOR
                ? this._generateSvgViewPathObj(viewPath)
                : this._generateViewPathObj(viewPath);

            if (!viewPaths.isRotate) {
                const boxPoints = this._generateByBox(boundingBox.min, boundingBox.max);
                const boxMesh = this._generateMesh(new THREE.Shape(boxPoints), viewPaths.targetDepth - boundingBox.length.z);
                boxMesh.position.z = -viewPaths.targetDepth;
                group.add(boxMesh);
            }
            group.add(mesh);
        }

        return group;
    }

    _generateBackground(viewPaths, size) {
        const group = new THREE.Group();
        if (viewPaths.isRotate) {
            let start = 0;
            const holes = viewPaths.holes;
            for (const hole of holes) {
                if (hole.min > start) {
                    const geometry = new THREE.CylinderGeometry(viewPaths.diameter / 2, viewPaths.diameter / 2, hole.min - start, 32);
                    const material = new THREE.MeshPhongMaterial({ color: '#fee5c6' });
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.y = (hole.min + start) / 2;
                    group.add(mesh);
                }
                start = hole.max;
            }
            if (size.y > start) {
                const geometry = new THREE.CylinderGeometry(viewPaths.diameter / 2, viewPaths.diameter / 2, size.y - start, 32);
                const material = new THREE.MeshPhongMaterial({ color: '#fee5c6' });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = (size.y + start) / 2;
                group.add(mesh);
            }
        } else {
            const points = this._generateByBox({ x: -size.x, y: -size.y }, { x: size.x, y: size.y });

            const shape = new THREE.Shape(points);

            for (const hole of viewPaths.holes) {
                shape.holes.push(new THREE.Shape(hole));
            }

            const mesh = this._generateMesh(shape, viewPaths.targetDepth);
            mesh.position.z = -viewPaths.targetDepth;
            group.add(mesh);
        }
        return group;
    }

    _generateByBox(min, max) {
        return [
            { x: min.x, y: min.y },
            { x: max.x, y: min.y },
            { x: max.x, y: max.y },
            { x: min.x, y: max.y },
            { x: min.x, y: min.y }
        ];
    }

    _generateMesh(shapes, depth) {
        const geometry = new THREE.ExtrudeGeometry(shapes, {
            steps: 2,
            depth: depth,
            bevelEnabled: false
        });
        // eslint-disable-next-line no-unused-vars
        const material = new THREE.MeshPhongMaterial({ color: '#fee5c6' });
        return new THREE.Mesh(geometry, material);
    }
}
