    import * as THREE from './lib/three.module.js';
import {OrbitControls} from './lib/OrbitControls.js';
import {OBJLoader2} from './lib/OBJLoader2.js';
import {MTLLoader} from './lib/MTLLoader.js';
import {MtlObjBridge} from './lib/MtlObjBridge.js';

function main() {
    
    // SETUP
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({
        canvas, 
        alpha: true, 
        logarithmicDepthBuffer: true,
    });
    renderer.shadowMap.enabled = true;

    let camera; 
    initCamera();
    function updateCamera(){ camera.updateProjectionMatrix(); }
    let controls = new OrbitControls(camera, canvas);
    
    const scene = new THREE.Scene();
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const spheGeometry = new THREE.SphereBufferGeometry(.5, 32, 16);
    const coneGeometry = new THREE.ConeBufferGeometry(.5, 1, 20)
    const cylnGeometry = new THREE.CylinderBufferGeometry(.5, .5, 1, 20);
    const dd20Geometry = new THREE.IcosahedronBufferGeometry(.5);
    const dd12Geometry = new THREE.DodecahedronBufferGeometry(.5);
    const dd08Geometry = new THREE.OctahedronBufferGeometry(.5);
    const dd04Geometry = new THREE.TetrahedronBufferGeometry(.5);

    const shapes = [];
    const torches = [];

    initLight();
    setupScene();
    requestAnimationFrame(render);


    function render(time) {
        time *= 0.001;
        if(resizeRendererToDisplaySize(renderer)){
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            updateCamera();
        }

        for(var c = 0; c < shapes.length; c++){
            scene.add(shapes[c]);
        }

        for(var c = 0; c < torches.length; c++){
            if((c-2) % 3 == 0){
                const speed = 15;
                const rot = time * speed;
                torches[c].rotation.x = rot;
                torches[c].rotation.y = rot;
                torches[c].rotation.z = rot;
            }
            scene.add(torches[c]);
        }

        // torches.forEach((cube, ndx) => {
        //     const speed = .2 + ndx * .1;
        //     const rot = time * speed;
        //     if(){
        //         cube.rotation.x = rot;
        //         cube.rotation.y = rot;
        //     }
        // });

        // pickHelper.pick(pickPosition, scene, camera, time);

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    function initCamera(){
        const fov = 50;
        const aspect = 2;  // the canvas default
        const near = 0.1;
        const far = 100;
        camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 12, 30);
        
        const controls = new OrbitControls(camera, canvas);
        controls.target.set(0, 12, 0);
        controls.update();
    }

    function initLight(){
        const aLight = new THREE.AmbientLight(0xFFFFFF, 1);
        scene.add(aLight);

        const skyColor = 'gray';  
        const groundColor = 'black';  
        const hLight = new THREE.HemisphereLight(skyColor, groundColor, .5);
        scene.add(hLight);

        const color = 0xFFFFFF;
        const light = new THREE.PointLight(color, 1);
        light.castShadow = true;
        light.position.set(0, 12, 0);
        scene.add(light);
    
        // const helper = new THREE.PointLightHelper(light);
        // scene.add(helper);

        // const pLight = new THREE.PointLight(0xFFFFFF, 1);
        // pLight.position.set(5, 10, 0);
        // scene.add(pLight);

        // const sLight = new THREE.SpotLight(0xFFFFFF, 2, 100, 1, 1);
        // sLight.position.set(10, 10, 0);
        // scene.add(sLight);
        // scene.add(sLight.target);

        // const helper = new THREE.SpotLightHelper(sLight);
        // scene.add(helper);

    }

    function makeLabel(labelWidth, size, name, posxyz) {
        const canvas = makeLabelCanvas(labelWidth, size, name);
        const texture = new THREE.CanvasTexture(canvas);

        texture.minFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
    
        const labelMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
        });
      
        const root = new THREE.Object3D();
  
        const labelBaseScale = 0.01;
        const label = new THREE.Sprite(labelMaterial);
        root.add(label);
        label.position.x = posxyz[0];
        label.position.y = posxyz[1]+4;
        label.position.z = posxyz[2];
        
        label.scale.x = canvas.width  * labelBaseScale;
        label.scale.y = canvas.height * labelBaseScale;
    
        scene.add(root);
        return root;
    }

    function makeLabelCanvas(baseWidth, size, name) {
        const borderSize = 2;
        const ctx = document.createElement('canvas').getContext('2d');
        const font =  `${size}px bold sans-serif`;
        ctx.font = font;
        // measure how long the name will be
        const textWidth = ctx.measureText(name).width;
    
        const doubleBorderSize = borderSize * 2;
        const width = baseWidth + doubleBorderSize;
        const height = size + doubleBorderSize;
        ctx.canvas.width = width;
        ctx.canvas.height = height;
    
        // need to set font again after resizing canvas
        ctx.font = font;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
    
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, width, height);
    
        // scale to fit but don't stretch
        const scaleFactor = Math.min(1, baseWidth / textWidth);
        ctx.translate(width / 2, height / 2);
        ctx.scale(scaleFactor, 1);
        ctx.fillStyle = 'white';
        ctx.fillText(name, 0, 0);
    
        return ctx.canvas;
    }

    function buildshapes(){
        for(var cu = 0; cu < 8; cu++){
            const cube1 = makeTexShape('cube', './textures/stone.jpg');
            cube1.position.set(2*cu+4, 2, 1+cu);
            cube1.scale.set(2, 1.2*cu+4, 3);
            cube1.rotation.y = THREE.Math.degToRad(63);

            const cube2 = makeTexShape('cube', './textures/stone.jpg');
            cube2.position.set(-13, 2.99, -2*cu);
            cube2.scale.set(2, 7, 2);

            const cube3 = makeTexShape('cube', './textures/stone.jpg');
            cube3.position.set(-13+cu, 2.99, -14);
            cube3.scale.set(1, 7, 2);
        }

        for(var cy = 0; cy < 7; cy++){
            const colm1 = makeTexShape('cyln', './textures/column.jpg');
            colm1.position.set(-17+cy*4, 2.99, 17);
            colm1.scale.set(2, 6, 2);
        }

        makeStalagtites([-5,0,-9], 1.5, './textures/rock.jpg');
        makeStalagtites([6,0,8], 1.2, './textures/rock.jpg');
        makeStalagtites([19,0,-2], 2, './textures/rock.jpg');

        makeTorch([-8,0,3], './textures/rock.jpg', './textures/fire.jpg');
        makeTorch([-16,0,-16], './textures/rock.jpg', './textures/fire.jpg');
        makeTorch([9,0,-3], './textures/rock.jpg', './textures/fire.jpg');
        makeTorch([17,0,14], './textures/rock.jpg', './textures/fire.jpg');

        { // make dice 
            const d20 = makeBasicShape('dd20', 0xccc1ff);
            d20.position.set(-11, 1.2, 10);
            d20.scale.set(3,3,3);
            d20.rotation.x = THREE.Math.degToRad(20);

            const d202 = makeBasicShape('dd20', 'pink');
            d202.position.set(11, 1.2, 15);
            d202.scale.set(3,3,3);
            d202.rotation.x = THREE.Math.degToRad(20);

            const d12 = makeBasicShape('dd12', 'lightgreen');
            d12.position.set(-18, 1, 6);
            d12.scale.set(2.5,2.5,2.5);
            d12.rotation.x = THREE.Math.degToRad(32);

            const d08 = makeBasicShape('dd08', 'pink');
            d08.position.set(-15, .75, 5);
            d08.scale.set(2.5,2.5,2.5);
            d08.rotation.x = THREE.Math.degToRad(36);
            d08.rotation.z = THREE.Math.degToRad(46);

            const d082 = makeBasicShape('dd08', 'lightgreen');
            d082.position.set(-16, .75, 8);
            d082.scale.set(2.5,2.5,2.5);
            d082.rotation.x = THREE.Math.degToRad(50);
            // d082.rotation.z = THREE.Math.degToRad(-60);
            d082.rotation.y = THREE.Math.degToRad(45);

            const d061 = makeBasicShape('cube', 'lightgreen');
            d061.position.set(15, .75, 14);
            d061.scale.set(1.5,1.5,1.5);
            d061.rotation.y = THREE.Math.degToRad(70);

            const d062 = makeBasicShape('cube', 0xfcfc92);
            d062.position.set(-16, .75, 11);
            d062.scale.set(1.5,1.5,1.5);
            d062.rotation.y = THREE.Math.degToRad(110);

            const d063 = makeBasicShape('cube', 0xfcfc92);
            d063.position.set(11, .75, 9);
            d063.scale.set(1.5,1.5,1.5);
            d063.rotation.y = THREE.Math.degToRad(-130);

            const d04 = makeBasicShape('dd04', 0xccc1ff);
            d04.position.set(14, .45, 11);
            d04.scale.set(2.5,2.5,2.5);
            d04.rotation.y = THREE.Math.degToRad(45);
            d04.rotation.x = THREE.Math.degToRad(125);
        }

        {
            // const loadManager = new THREE.LoadingManager();
            // const loader = new THREE.TextureLoader(loadManager);
        
            // const diceMaterials = [
            //     new THREE.MeshPhongMaterial({map: loader.load('./numbers/1.png')}),
            //     new THREE.MeshPhongMaterial({map: loader.load('./numbers/2.png')}),
            //     new THREE.MeshPhongMaterial({map: loader.load('./numbers/3.png')}),
            //     new THREE.MeshPhongMaterial({map: loader.load('./numbers/4.png')}),
            //     new THREE.MeshPhongMaterial({map: loader.load('./numbers/5.png')}),
            //     new THREE.MeshPhongMaterial({map: loader.load('./numbers/6.png')}),
            //     new THREE.MeshPhongMaterial({map: loader.load('./numbers/7.png')}),
            //     new THREE.MeshPhongMaterial({map: loader.load('./numbers/8.png')}),
            // ];
            
            // loadManager.onLoad = () => {
            //     const cube = new THREE.Mesh(cubeGeometry, diceMaterials);
            //     cube.position.set(0, 2, 0);
            //     cube.receiveShadow = true; 
            //     cube.castShadow = true; 
            //     shapes.push(cube);  
            // };
        }
    }

    function makeStalagtites(pos, s, tex){
        const stal1 = makeTexShape('cone', tex);
        stal1.position.set(pos[0]-3, (5/2)-.01, pos[2]+0);
        stal1.scale.set(s*2, s*5, s*2);

        const stal2 = makeTexShape('cone', tex);
        stal2.position.set(pos[0]-2.5, (3/2)-.01, pos[2]+1.2);
        stal2.scale.set(s*1.5, s*3, s*1.5);

        const stal3 = makeTexShape('cone', tex);
        stal3.position.set(pos[0]-1.7, (2/2)-.01, pos[2]+.6);
        stal3.scale.set(s*1, s*2, s*1);
    }

    function makeTorch(pos, texShaft, texFire){

        const loadManager = new THREE.LoadingManager();
        const loader = new THREE.TextureLoader(loadManager);
        
        var texture1 = loader.load(texShaft);
        const material1 = new THREE.MeshPhongMaterial({  map: texture1 });

        var texture2 = loader.load(texFire);
        const material2 = new THREE.MeshPhongMaterial({  map: texture2 });

        const shaft = new THREE.Mesh(cylnGeometry, material1);
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        shaft.position.set(pos[0]+0, 1.5, pos[2]+0);
        shaft.scale.set(.5, 3, .5);
        torches.push(shaft);

        const bowl = new THREE.Mesh(cylnGeometry, material1);
        bowl.castShadow = false;
        bowl.receiveShadow = true;
        bowl.position.set(pos[0]+0, 3, pos[2]+0);
        bowl.scale.set(.75, .2, .75);
        torches.push(bowl);

        const fire = new THREE.Mesh(dd20Geometry, material2);
        fire.castShadow = false;
        fire.receiveShadow = true;
        fire.position.set(pos[0]+0, 3.5, pos[2]+0);
        fire.scale.set(.75, .75, .75);

        const fLight = new THREE.PointLight(0xFF0000, 1);
        fLight.castShadow = true;
        fire.add(fLight);

        torches.push(fire);
    }

    function makeBasicShape(shape, color){
        let geometry;
        if(shape == 'cube'){ geometry = cubeGeometry; }
        else if(shape == 'sphe'){ geometry = spheGeometry; }
        else if(shape == 'cone'){ geometry = coneGeometry; }
        else if(shape == 'cyln'){ geometry = cylnGeometry; }
        else if(shape == 'dd20'){ geometry = dd20Geometry; }
        else if(shape == 'dd12'){ geometry = dd12Geometry; }
        else if(shape == 'dd08'){ geometry = dd08Geometry; }
        else if(shape == 'dd04'){ geometry = dd04Geometry; }

        const material = new THREE.MeshPhongMaterial({color});
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        shapes.push(cube);
        return cube;
    }

    function makeTexShape(shape, tex){
        let geometry;
        if(shape == 'cube'){ geometry = cubeGeometry; }
        else if(shape == 'sphe'){ geometry = spheGeometry; }
        else if(shape == 'cone'){ geometry = coneGeometry; }
        else if(shape == 'cyln'){ geometry = cylnGeometry; }
        else if(shape == 'dd20'){ geometry = dd20Geometry; }
        else if(shape == 'dd12'){ geometry = dd12Geometry; }
        else if(shape == 'dd08'){ geometry = dd08Geometry; }
        else if(shape == 'dd04'){ geometry = dd04Geometry; }

        const loadManager = new THREE.LoadingManager();
        const loader = new THREE.TextureLoader(loadManager);

        var texture = loader.load( tex, function ( texture ) {
            if(tex == './textures/stone.jpg'){
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(.40, 1);
            }
        } );

        const material = new THREE.MeshPhongMaterial({
            map: texture,
        });

        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        shapes.push(cube);
        return cube;
    }

    function loadCustomObj(){
        { // dragon 
            const mtlLoader = new MTLLoader();
            mtlLoader.load('./dragon_obj/dragon.mtl', (mtlParseResult) => {
                const dragLoader = new OBJLoader2();
                const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
                dragLoader.addMaterials(materials);
                dragLoader.load('./dragon_obj/dragon.OBJ', (root) => {
                    root.traverse( function (obj) { if (obj.isMesh){obj.receiveShadow = true; obj.castShadow = true; } });
                    root.rotation.y = THREE.Math.degToRad(-30);
                    root.scale.set(.2,.2,.2);
                    root.position.set(5,-.2,-22);
                    root.receiveShadow = true;
                    root.castShadow = true;
                    scene.add(root);
                });
            });
        }

        { // cleric 
            const dragLoader = new OBJLoader2();
            dragLoader.load('./party/cleric.obj', (root) => {
                root.traverse( function (obj) { if (obj.isMesh){
                    obj.receiveShadow = true; 
                    obj.castShadow = true; 
                    obj.material.color.set(0xaa55aa);}
                });
                root.rotation.y = THREE.Math.degToRad(135);
                root.scale.set(.4,.4,.4);
                root.position.set(-5,0,9);
                root.receiveShadow = true;
                root.castShadow = true;
                scene.add(root);
            });
        }
        makeLabel(150, 32, 'Galinda', [-5,0,9]);

        { // dwarf 
            const dragLoader = new OBJLoader2();
            dragLoader.load('./party/dwarf.obj', (root) => {
                root.traverse( function (obj) { if (obj.isMesh){
                    obj.receiveShadow = true; 
                    obj.castShadow = true; 
                    obj.material.color.set(0x557acc);}
                });
                root.rotation.y = THREE.Math.degToRad(90);
                root.scale.set(.05,.05,.05);
                root.position.set(-7,0,7);
                root.receiveShadow = true;
                root.castShadow = true;
                scene.add(root);
            });
        }
        makeLabel(150, 32, 'Phillbert', [-7,-1,7]);
       
        { // rogue 
            const dragLoader = new OBJLoader2();
            dragLoader.load('./party/rogue.obj', (root) => {
                root.traverse( function (obj) { if (obj.isMesh){ 
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                    obj.material.color.set(0x339933);} 
                });
                root.rotation.z = THREE.Math.degToRad(220);
                root.rotation.x = THREE.Math.degToRad(-90);
                root.scale.set(.03,.03,.03);
                root.position.set(7,0,5);
                scene.add(root);
            });
        }      
        makeLabel(150, 32, 'Theavy', [7,.5,5]);

        { // barb 
            const dragLoader = new OBJLoader2();
            dragLoader.load('./party/k2.obj', (root) => {
                root.traverse( function (obj) { if (obj.isMesh){ 
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                    if(obj.material.color){ obj.material.color.setHex(0xffff00); }
                    else { obj.material.color = new THREE.Color('yellow'); }
                } 
                });
                root.rotation.x = THREE.Math.degToRad(-90);
                root.rotation.z = THREE.Math.degToRad(200);
                root.scale.set(.002,.002,.002);
                root.position.set(-7,2.3,-1);
                scene.add(root);
            });
        }      
        makeLabel(150, 32, 'Sildar', [-7,1,-1]);

        { //gold
            const loader = new OBJLoader2();
            loader.load('./envi/gold.obj', (root) => {
                root.traverse( function (obj) { if (obj.isMesh){ 
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                    obj.material.color.set(0x999900);} 
                });
                // root.rotation.z = THREE.Math.degToRad(220);
                root.rotation.y = THREE.Math.degToRad(-180);
                root.scale.set(.4,.3,.4);
                root.position.set(3,0,-11);
                scene.add(root);
            });
        }

        { //chest
            const loader = new OBJLoader2();
            loader.load('./envi/chest_h.obj', (root) => {
                root.traverse( function (obj) { if (obj.isMesh){ 
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                    obj.material.color.set(0x654321);} 
                });
                // root.rotation.z = THREE.Math.degToRad(220);
                root.rotation.y = THREE.Math.degToRad(-180);
                root.scale.set(.07,.07,.07);
                root.position.set(0,0,-13);
                root.rotation.z = THREE.Math.degToRad(-10);
                scene.add(root);
            });
        }
    }

    function setupScene(){
        buildshapes();
        loadCustomObj();

        { // Floor
            const planeSize = 40;
        
            const loader = new THREE.TextureLoader();
            const texture = loader.load('./textures/floor.jpg');
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.NearestFilter;
            const repeats = planeSize / 8;
            texture.repeat.set(repeats, repeats);
        
            const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
            const planeMat = new THREE.MeshPhongMaterial({
                map: texture,
                side: THREE.DoubleSide,
            });
            const mesh = new THREE.Mesh(planeGeo, planeMat);
            mesh.rotation.x = Math.PI * -.5;
            mesh.receiveShadow = true;
            scene.add(mesh);
        }

        {  // Fog
            const color = 0x333333; 
            const near = 0;
            const far = 50;
            scene.fog = new THREE.Fog(color, near, far);
            scene.background = new THREE.Color('#333333');
        }

        {
            const loader = new THREE.TextureLoader();
            const texture = loader.load(
                './textures/cave.jpg',() => {
                const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
                rt.fromEquirectangularTexture(renderer, texture);
                scene.background = rt;
            });

            // { // sky
            //     const loader = new THREE.CubeTextureLoader();
            //     const texture = loader.load([
            //         'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
            //         'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
            //         'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
            //         'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
            //         'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
            //         'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-z.jpg',
            //     ]);
            // scene.background = new THREE.Color('#000');  // red;
            // }
        }
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width  = canvas.clientWidth  * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
    }

}
main();
