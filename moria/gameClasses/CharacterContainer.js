// Define our player character container classes
var CharacterContainer = IgeEntity.extend({
	classId: 'CharacterContainer',

	init: function () {
		var self = this;
		IgeEntity.prototype.init.call(this);
		
		if (ige.isClient) {
			// Setup the entity 3d bounds
			self.bounds3d(20, 20, 40);
	
			// Create a character entity as a child of this container
			self.character = new Character()
				.id(self.id() + '_character')
				.drawBounds(false)
				.drawBoundsData(false)
				.originTo(0.5, 0.3, 0.5)
				.mount(self);
			
			// Set the co-ordinate system as isometric
			this.isometric(true);
		}
		
		if (ige.isServer) {
			this.addComponent(IgePathComponent);

			this.path
				.finder(ige.server.pathFinder)
				.tileMap(ige.server.foregroundMap)
				.tileChecker(function (tileData, tileX, tileY, node, prevNodeX, prevNodeY, dynamic) {
					// If the map tile data is set to 1, don't allow a path along it
					if (typeof tileData === 'string') {
						return tileData === this._id;
					}

					return tileData !== 1;
				})
				.lookAheadSteps(3)
				.dynamic(true)
				.allowSquare(true) // Allow north, south, east and west movement
				.allowDiagonal(true); // Allow north-east, north-west, south-east, south-west movement


			// Register some event listeners for the path
			this.path.on('pointComplete', function (entity) {
				console.log('Path point reached...');

				// Mark the previous point as un-blocked
				var previousCell = entity.path.getPreviousPoint(0),
					nextCell = entity.path.getNextPoint(0);

				if (previousCell !== undefined) {
					//ige.server.foregroundMap.unOccupyTile(previousCell.x, previousCell.y, 1, 1);
				}

				// Mark the current point as blocked
				//ige.server.foregroundMap.occupyTile(nextCell.x, nextCell.y, 1, 1, entity._id);
			});

			this.path.on('pathComplete', function (entity, currentCellX, currentCellY) {
				console.log('Path completed...');
			});

			this.path.on('dynamicFail', function (entity, pathFrom, pathTo) {
				console.log('Dynamic path update required but could not find valid path to desination.');
			});
		}
		
		// Define the data sections that will be included in the stream
		this.streamSections(['transform', 'direction']);
	},
	
	/**
	 * Override the default IgeEntity class streamSectionData() method
	 * so that we can check for the custom1 section and handle how we deal
	 * with it.
	 * @param {String} sectionId A string identifying the section to
	 * handle data get / set for.
	 * @param {*=} data If present, this is the data that has been sent
	 * from the server to the client for this entity.
	 * @return {*}
	 */
	streamSectionData: function (sectionId, data) {
		// Check if the section is one that we are handling
		if (sectionId === 'direction') {
			// Check if the server sent us data, if not we are supposed
			// to return the data instead of set it
			if (ige.isClient) {
				if (data) {
					// We have been given new data!
					this._streamDir = data;
				} else {
					this._streamDir = 'stop';
				}
			} else {
				// Return current data
				return this._streamDir;
			}
		} else {
			// The section was not one that we handle here, so pass this
			// to the super-class streamSectionData() method - it handles
			// the "transform" section by itself
			return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
		}
	},

	update: function (ctx, tickDelta) {
		if (ige.isServer) {
			// Make sure the character is animating in the correct
			// direction - this variable is actually streamed to the client
			// when it's value changes!
			this._streamDir = this.path.getDirection();
		} else {
			// Set the depth to the y co-ordinate which basically
			// makes the entity appear further in the foreground
			// the closer they become to the bottom of the screen
			this.depth(this._translate.y);
			
			if (this._streamDir) {
				if ((this._streamDir !== this._currentDir || !this.character.animation.playing())) {
					this._currentDir = this._streamDir;
					
					var dir = this._streamDir;
					// The characters we are using only have four directions
					// so convert the NW, SE, NE, SW to N, S, E, W
					switch (this._streamDir) {
						case 'S':
							dir = 'W';
							break;
						
						case 'E':
							dir = 'E';
							break;
						
						case 'N':
							dir = 'E';
							break;
						
						case 'W':
							dir = 'W';
							break;
					}
					
					if (dir && dir !== 'stop') {
						this.character.animation.start(dir);
					} else {
						this.character.animation.stop();
					}
				}
			} else {
				this.character.animation.stop();
			}
		}
		
		IgeEntity.prototype.update.call(this, ctx, tickDelta);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = CharacterContainer; }
