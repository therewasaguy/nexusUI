/** 
	@class regions      
	Region selection within a waveform
	```html
	<canvas nx="regions"></canvas>
	```
	<canvas nx="regions" style="margin-left:25px"></canvas>
*/

// TODO: incorporate drag and drop buffer loading & gibber compatibility
// TODO: Implement scrollbar animation via this.animate

function regions(target, transmitCommand) {
					
	//self awareness
	var self = this;
	this.defaultSize = { width: 300, height: 75 };
	
	//get common attributes and methods
	getTemplate(self, target, transmitCommand);
	
	//unique attributes
	this.numRegions = 5;

	/** @property {object}  val   
		| &nbsp; | data
		| --- | ---
		| region.*(region index)* | start
		| region.*(region index)* | stop
	*/
	this.val = new Object();
	for (var i=0;i<self.numRegions;i++) {
		this.val[i] = {
			start: (0.1 * i),
			stop: 0.5+ (0.1 * i)
		};
	}
	this.bufferLength = 1000.;		// length of the buffer in ms
	this.regionClicked = 0;
	this.regionColorR = [0.737,0.667,0.667,0.965,0.933];
	this.regionColorG = [0.345,0.761,1.,1.,0.596];
	this.regionColorB = [0.,1.,0.729,0.667,1.];
	this.regionColorA = [1.,1.,1.,1.,1.];
	this.regionColors = {
		"r": [0.737,0.667,0.667,0.965,0.933],
		"g": [0.345,0.761,1.,1.,0.596],
		"b": [0.,1.,0.729,0.667,1.],
		"a": [1.,1.,1.,1.,1.]
	}
	
	this.realSpace = { x: self.width-self.padding*2, y: self.height-self.padding*2 };

	this.last_x = 0;				// cache mouse position in pixels for tracking delta movements
	this.last_y = 0;
	this.listLength = 0;
	// this.selected = 0;
	this.buttonClick = 0;
	this.clicked = 0;
	
	this.scrollPosition = 0.;		
	this.lastScroll = (-1. * aspect);
	this.vbrgb = [0.5,0.55,0.73,1.];
	this.colorWaveform = [0.,0.,0.,1.,];
	this.currentAmplitude = 0.;
	this.scroll = 0.;
	this.amplitudeLow = 0.;
	
	// test
	this.init = function() {
		self.realSpace = { x: self.width-self.padding*2, y: self.height-self.padding*2 }
		self.draw();
	}

	this.draw = function() {
		self.erase();
		self.makeRoundedBG();
		with (this.context) {
			strokeStyle = self.colors.border;
			fillStyle = self.colors.fill;
			lineWidth = self.lineWidth;
			stroke();
			fill();
			
			// TODO: Draw Waveform - use an offscreen buffer to render and copy in...
			
			strokeStyle = self.colors.accent;
			fillStyle = slef.colors.accent;
			lineWidth = 5;
	    
// 	    	"rgba(255,85,0,0.5)"	

			for(i=0; i<self.numRegions; i++) {
				beginPath();
				if (i == self.regionClicked) {
					strokeStyle = "rgba("+self.regionColors.r[i]+","+self.regionColors.g[i]+","+self.regionColors.b[i]+","+self.regionColors.a[i]*0.4+")";
					fillStyle = "rgba("+self.regionColors.r[i]+","+self.regionColors.g[i]+","+self.regionColors.b[i]+","+self.regionColors.a[i]+")";
				} else {
					strokeStyle = "rgba("+self.regionColors.r[i]+","+self.regionColors.g[i]+","+self.regionColors.b[i]+","+self.regionColors.a[i]*0.2+")";
					fillStyle = "rgba("+self.regionColors.r[i]+","+self.regionColors.g[i]+","+self.regionColors.b[i]+","+self.regionColors.a[i]*0.4+")";
				}
				
				moveTo(self.padding+(self.val[i].start * self.realSpace.x), self.padding);
				lineTo(self.padding+(self.val[i].start * self.realSpace.x), self.height-self.padding);
				stroke();
				lineTo(self.padding+(self.val[i].end * self.realSpace.x), self.height-self.padding);
				lineTo(self.padding+(self.val[i].end * self.realSpace.x), self.padding);
				stroke();
				fill();
				closePath();
			}
		}
		self.drawBoxes();
		self.drawLabel();
	}
	
	this.drawBoxes = function() {
		var h = 0;
		var left = 0;
		var right = 0;

		with (this.context) {
			for (i = 0; i < numRegions; i++) {
				h = (i + 1);
				left = self.padding+((i * 0.2) * self.realSpace.x);
				right = self.padding+((h * 0.2) * self.realSpace.x);
				beginPath();
				if (i == self.regionClicked) {
					strokeStyle = self.colors.accentborder;
					fillStyle = "rgba("+self.regionColors.r[i]+","+self.regionColors.g[i]+","+self.regionColors.b[i]+","+self.regionColors.a[i]+")";
				} else {
					strokeStyle = self.colors.border;
					fillStyle = "rgba("+self.regionColors.r[i]+","+self.regionColors.g[i]+","+self.regionColors.b[i]+","+self.regionColors.a[i]+")";
				}
				
				moveTo(left,self.height-self.padding);
				lineTo(right, self.height-self.padding);
				lineTo(right, (self.height* 0.8)-self.padding);
				lineTo(left, (self.height*0.8)-self.padding);
				stroke();
				fill();
				closePath();
			}
		}
	}
	
	this.drawWaveform = function() {
		/*
		scroll = ((scrollPosition * aspect * 2.) - aspect);
		amplitudeLow = (currentAmplitude * -1.);

		with (rendersketch) {

			if (lastScroll > scroll) {			// if scroll wrapped around, fix ends
				glcolor(vbrgb);
				quad(lastScroll, 1.0, 0., boxRight, 1.0, 0., boxRight, -1.,0., lastScroll, -1., 0.);
				glcolor(colorWaveform);						// update waveform
				quad(lastScroll, currentAmplitude, 0., boxRight, currentAmplitude, 0., boxRight, amplitudeLow,0., lastScroll, amplitudeLow, 0.);

				lastScroll = boxLeft;		// set lastScroll to far left to finish
			}

			glcolor(vbrgb);
			quad(lastScroll, 1.0, 0., scroll, 1.0, 0., scroll, -1.,0., lastScroll, -1., 0.);
			glcolor(colorWaveform);						// update waveform
			quad(lastScroll, currentAmplitude, 0., scroll, currentAmplitude, 0., scroll, amplitudeLow,0., lastScroll, amplitudeLow, 0.);

		}

		lastScroll = scroll;	
	*/
	}
	
	this.pixelPosition = function(region) {
		var position = {
			start: self.padding+(self.val[region].start * self.realSpace.x),
			end: self.padding+(self.val[region].end * self.realSpace.x)
		};
		return position;
	}
	
	this.withinRegion = function(x,region) {
		var position = self.pixelPosition(region);
		if (x > position.start) && x < position.end)
			return true;
		else {
			return false;
		}
	}
	
	this.click = function() {

			// check to see if button is clicked.
		self.buttonClick = 0;

		for (i = 0; i < numRegions; i++) {				// cycle through # of regions checking if boxes clicked
			h = (i + 1);
			left = self.padding+((i * 0.2) * self.realSpace.x);
			right = self.padding+((h * 0.2) * self.realSpace.x);

			if ((self.clickPos.x >= left) && (self.clickPos.x <= right) && (self.clickPos.y >= (self.height * 0.8)) {
				self.regionClicked = i;
				self.buttonClick = 1;
			}
		}
			// otherwise set new selection values
		if (self.buttonClick != 1) {			// if clicked not on box
						// if clicked outside selection, move selection to that point
			if (!self.withinRegion(self.clickPos.x, self.regionClicked)) {
				var position = self.pixelPosition(self.regionClicked);
						// change in pixels
				var dx = (self.clickPos.x - (position.start + (position.start - position.end) * 0.5));	
						// Update region position and clip to bounds
				self.val[regionClicked].start = nx.clip(((position.start + dx)-self.padding)/self.realSpace.x,0., 1.);
				self.val[regionClicked].end = nx.clip(((position.end + dx)-self.padding)/self.realSpace.x,0., 1.);
			}

			self.move();

		} else {						// if clicked on a box
			self.draw();
		}
	}

	this.move = function() {
		if (!self.buttonClick) {

			var scaleVal = [0.01, 1.0];			// scaling for [width, x position]
			/*	// Do we want an alternative rate of change if shift held down?
			if (shift) {
				scaleVal = [0.001, 0.02];
			}
			*/

			// This is the preliminary xy draging adjustment.

			var dx = self.deltaMove.x;					// change in x
			var dy = self.deltaMove.y;					// change in y

															// x = x±ychange + (change in x)
			self.val[regionClicked].start = (regionX1[selected] + (dy * scaleVal[0])) + (dx * scaleVal[1]);
			regionX1[selected] = Math.min(Math.max(boxLeft, regionX1[selected]), regionX2[selected]);

			self.val[regionClicked].end = (regionX2[selected] - (dy * scaleVal[0])) + (dx * scaleVal[1]);
			regionX2[selected] = Math.min(Math.max(regionX1[selected], regionX2[selected]), boxRight);

			draw();  // now done by the task.
		}
		
		var msg = new Object()
		msg[sliderToMove] = self.val[sliderToMove]
		msg["list"] = new String();
		for (var key in self.val) { msg["list"] += self.val[key] + " " }
		self.nxTransmit(msg);
		
		
		
	}
	
	this.setNumberOfRegions = function(numOfRegions) {
		self.numRegions = numOfRegions;
		self.values = new Array();
		for (var i=0;i<this.sliders;i++) {
			this.values.push(0.5);
		}
		self.init();
	}
	
}
