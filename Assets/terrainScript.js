﻿#pragma strict

var terrain : Terrain;
var imageTA : TextAsset;

private var terrainDat : TerrainData;
private var xNumSamps : int;
private var xSampWidth : int;
private var zNumSamps : int;
private var zSampWidth : int;
private var heights : float[,]; //height array, index as z,x
private var tSize : Vector3; //total size in world units

function Start () {

	//load heightmap
	var tex = new Texture2D(512,512);
	tex.LoadImage(imageTA.bytes);
	

	terrainDat = terrain.terrainData;
	xNumSamps = terrainDat.heightmapWidth; //x size of heightmap
	zNumSamps = terrainDat.heightmapHeight;
	tSize = terrainDat.size; //world size
	Debug.Log("terrainSize=" + tSize);
	xSampWidth = terrainDat.heightmapScale.x;
	zSampWidth = terrainDat.heightmapScale.z;
	
	heights = terrainDat.GetHeights(0,0,xNumSamps,zNumSamps);
	Debug.Log("xNumSamps=" + xNumSamps);
	Debug.Log("zNumSamps=" + zNumSamps);
	
	var origin : Vector3 = new Vector3(-479,225,136);
	var local = origin - terrain.transform.position;
	Debug.Log("local:" + local);
	
	var xAct : float = local.x * xNumSamps / tSize.x;
	var zAct : float = local.z * zNumSamps / tSize.z;
	Debug.Log("xAct=" + xAct + ", zAct=" + zAct);
	var xLow : int = Mathf.Floor(xAct);
	var xHigh : int = Mathf.Ceil(xAct);
	var zLow : int = Mathf.Floor(zAct);
	var zHigh : int = Mathf.Ceil(zAct);

	for(var x = 0; x < 512; x++){
		for(var z = 0; z < 512; z++){
			//for some reason saving the png in GIMP then reading it
			//here will swap the values
			heights[z,x] = tex.GetPixel(x, z).grayscale;
		}
	}
	
	
	for(var i = 0; i < xNumSamps; i++){
		Debug.Log("i=" + i + ", h=" + heights[i,136]);
		for(var ii = 300; ii < 330; ii++){
			heights[i,ii]=0;
		}
	}
		
	terrainDat.SetHeights(0,0,heights);
			
	var xhLow = heights[xLow,zLow]; //0,0
	var xhHigh = heights[xHigh,zLow]; //1,0
	var zhLow = heights[xLow,zHigh]; //0,1
	var zhHigh = heights[xHigh,zHigh]; //1,1
	Debug.Log("xhLow=" + xhLow);
	Debug.Log("xhHigh=" + xhHigh);
	Debug.Log("zhLow=" + zhLow);
	Debug.Log("zhHigh=" + zhHigh);
	
	var xCalc = (1 - xHigh - xAct) / (xHigh - xLow);
	var zCalc = (1 - zHigh - zAct) / (zHigh - zLow);
	
	var h : float = xCalc * (xhHigh - xhLow) + zCalc * (zhHigh - zhLow);
	h = h / 2;
	//var h : float = xhLow + (zhLow - xhLow) * xAct + (xhHigh - xhLow) * zAct + (xhLow - zhLow - xhHigh + zhHigh) * xAct * zAct;
	
	Debug.Log("height=" + terrainDat.GetHeight(xAct,zAct));
	Debug.Log("h=" + h);
	Debug.Log("hScaled=" + (h*tSize.y));
	Debug.Log("sampleHeight=" + terrain.SampleHeight(origin));
	
	//debug
	heights[xLow,zLow] = 0; //0,0
	heights[xHigh,zLow] = 0; //1,0
	heights[xLow,zHigh] = 0; //0,1
	heights[xHigh,zHigh] = 0;
}

function Update () {

}


function zeroHeight(worldXMin : int, worldXMax : int, worldZMin : int, worldZMax : int){

	if(heights == null){
		return;
	}
	//get point local to terrain
	var min : Vector3 = new Vector3(worldXMin, 0, worldZMin);
	min = terrain.transform.InverseTransformPoint(min);

	var max : Vector3 = new Vector3(worldXMax, 0, worldZMax);
	max = terrain.transform.InverseTransformPoint(max);

	Debug.Log("xMin-in" + min.x);
	Debug.Log("xMax-in" + max.x);
	Debug.Log("zMin-in" + min.z);
	Debug.Log("zMax-in" + max.z);

	//determine which samples are affected
	var xMinAct : int = min.x * xNumSamps / tSize.x;
	xMinAct = Mathf.Clamp(xMinAct, 0, xNumSamps);
	var xMaxAct : int = max.x * xNumSamps / tSize.x;
	xMaxAct = Mathf.Clamp(xMaxAct, 0, xNumSamps);
	
	var zMinAct : int = min.z * zNumSamps / tSize.z;
	zMinAct = Mathf.Clamp(zMinAct, 0, zNumSamps);
	var zMaxAct : int = max.z * zNumSamps / tSize.z;
	zMaxAct = Mathf.Clamp(zMaxAct, 0, zNumSamps);

	Debug.Log("Zeroing x["+xMinAct+"-"+xMaxAct+"], z["+zMinAct+"-"+zMaxAct+"]");

	for(var x = xMinAct; x < xMaxAct; x++){
		for(var z = zMinAct; z < zMaxAct; z++){
			heights[z,x]=0;
		}
	}
	terrainDat.SetHeights(0,0,heights);
		
}

