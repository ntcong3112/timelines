export { init, animate, targets, transform, onWindowResize };

import * as THREE from './lib/three.module.js';
import { TWEEN } from './lib/jsm/tween.module.min.js';
import { TrackballControls } from './lib/jsm/TrackballControls.js';
import { OrbitControls } from './lib/jsm/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from './lib/jsm/CSS3DRenderer.js';

import { EVENTS } from '../data/events.js';

// var ELEMENT_ALPHA = ( Math.random() * 0.5 + 0.25 );
var ELEMENT_ALPHA = 0.7;
var MIN_CONTROLS_DISTANCE = 0;
var MAX_CONTROLS_DISTANCE = 12300;
var INIT_CAMERA_Z = 8000;
var camera, scene, renderer;
var controls;
var ORBIT = false;

var objects = [];
var targets = { table: [], sphere: [], helix: [], grid: [] };

function init() {
	document.getElementById('widget').style.visibility = 'visible';
	// camera
	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = INIT_CAMERA_Z;
	// scene
	scene = new THREE.Scene();
	// initialize event objects and table view
	for ( var i = 0; i < EVENTS.length; i ++ ) {

		var event = EVENTS[i];

		var element = document.createElement( 'div' );
		element.className = 'element';
		element.style.backgroundColor = 'rgba(0,40,120,' + ELEMENT_ALPHA + ')';

		var number = document.createElement( 'div' );
		number.className = 'number';
		number.textContent = ( i / 5 ) + 1;
		element.appendChild( number );

		var year = document.createElement( 'div' );
		year.className = 'year';
		year.textContent = event['date']; // date
		element.appendChild( year );

		var details = document.createElement( 'div' );
		details.className = 'details';
		// var tab = '&nbsp;&nbsp;&nbsp;&nbsp;';
		var dtext = event['description'];
		details.innerHTML = dtext + '<br><img src="' + event['imgsrc'] + '" />';
		element.appendChild( details );

		var object = new CSS3DObject( element );
		object.name = dtext;
		object.position.x = Math.random() * 4000 - 2000;
		object.position.y = Math.random() * 4000 - 2000;
		object.position.z = Math.random() * 4000 - 2000;
		scene.add( object );

		objects.push( object );

		// create and capture TABLE view to tween to later

		var object = new THREE.Object3D();
		var xmargin = 280;
		var xoffset = 1800;
		var xpos = ( event['order'] * xmargin ) - xoffset;
		var ypos = 300;
		// var ypos = - ( table[ i + 4 ] * 180 ) + 990;
		object.position.x = xpos * 3;
		object.position.y = ypos * 3;
		targets.table.push( object );
	}

	// create and capture SPHERE view to tween to later

	var vector = new THREE.Vector3();
	for ( var i = 0, l = objects.length; i < l; i ++ ) {
		var phi = Math.acos( - 1 + ( 2 * i ) / l );
		var theta = Math.sqrt( l * Math.PI ) * phi;
		var object = new THREE.Object3D();
		var size = 1400;
		object.position.setFromSphericalCoords( size, phi, theta );
		vector.copy( object.position ).multiplyScalar( 2 );
		object.lookAt( vector );
		targets.sphere.push( object );
	}

	// create and capture HELIX view to tween to later

	var vector = new THREE.Vector3();
	for ( var i = 0, l = objects.length; i < l; i ++ ) {
		// var tune = 0.175;
		var tune = 0.5;
		var theta = i * tune + Math.PI;
		var yoffset = 1500;
		var ystretch = 200;
		var y = - ( i * ystretch ) + yoffset;
		var object = new THREE.Object3D();
		object.position.setFromCylindricalCoords( 1600, theta, y );
		vector.x = object.position.x * 2;
		vector.y = object.position.y;
		vector.z = object.position.z * 2;
		object.lookAt( vector );
		targets.helix.push( object );
	}

	// create and capture GRID view to tween to later

	for ( var i = 0; i < objects.length; i ++ ) {
		var object = new THREE.Object3D();
		var offset = 1600;
		var scalar = 800;
		object.position.x = ( ( i % 5 ) * scalar ) - offset;
		object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * scalar ) + offset;
		object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;
		targets.grid.push( object );
	}

	// cube

	// for ( var i = 0; i < objects.length; i ++ ) {
	// 	var object = new THREE.Object3D();
	// 	var offset = 1600;
	// 	var scalar = 800;
	// 	object.position.x = ( ( i % 5 ) * scalar ) - offset;
	// 	object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * scalar ) + offset;
	// 	object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;
	// 	targets.cube.push( object );
	// }

	//

	renderer = new CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById( 'container' ).appendChild( renderer.domElement );

	//

	if (ORBIT == true) {
		controls = new OrbitControls( camera, renderer.domElement );
	} else {
		controls = new TrackballControls( camera, renderer.domElement );
	}
	controls.minDistance = MIN_CONTROLS_DISTANCE;
	controls.maxDistance = MAX_CONTROLS_DISTANCE;
	controls.addEventListener( 'change', render );
}

// this is the bit that makes every event seize up
// when a transform is initiated via button-press:
function companyHalt() {
	// camera.position.set(0, 0, INIT_CAMERA_Z); // Set position like this
	// camera.lookAt(new THREE.Vector3(0,0,10000)); // Set look at coordinate like this
	// var duration = 100;
	for (var i=0; i<objects.length; i++) {
		objects[i].rotation.x = 0;
		objects[i].rotation.y = 0;
		objects[i].rotation.z = 0;
		objects[i].quaternion.w = 1;
		objects[i].quaternion.x = 0;
		objects[i].quaternion.y = 0;
		objects[i].quaternion.z = 0;
		// var object = objects[ i ];
		// new TWEEN.Tween( object.rotation )
		// 	.to( { x: 0, y: 0, z: 0 }, Math.random() * duration + duration )
		// 	.easing( TWEEN.Easing.Exponential.InOut )
		// 	.start();
		// new TWEEN.Tween( object.quaternion )
		// 	.to( { x: 0, y: 0, z: 0, w: 1 }, Math.random() * duration + duration )
		// 	.easing( TWEEN.Easing.Exponential.InOut )
		// 	.start();
	}
}

function transform( targets, duration ) {
	// companyHalt();
	TWEEN.removeAll();
	for ( var i = 0; i < objects.length; i ++ ) {
		var object = objects[ i ];
		var target = targets[ i ];
		new TWEEN.Tween( object.position )
			.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
		new TWEEN.Tween( object.rotation )
			.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
	}
	new TWEEN.Tween( this )
		.to( {}, duration * 2 )
		.onUpdate( render )
		.start();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	render();
}

function animate() {
	requestAnimationFrame( animate );
	TWEEN.update();
	controls.update();
}

function render() {
	renderer.render( scene, camera );
}
