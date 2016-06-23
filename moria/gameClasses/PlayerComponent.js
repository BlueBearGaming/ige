var PlayerComponent = IgeEntity.extend({
	classId: 'PlayerComponent',
	componentId: 'playerControl',

	init: function (entity, options) {
		var self = this;

		// Store the entity that this component has been added to
		this._entity = entity;

		// Store any options that were passed to us
		this._options = options;

		if (ige.isClient) {
			// Listen for mouse events on the texture map
			ige.client.mainScene.mouseUp(function (event) {
				var grid = ige.$('foregroundMap');
				// Send a message to the server asking to path to this tile
				var tile = grid.pointToTile(grid.mouseTilePoint());
				ige.network.send('playerControlToTile', [tile.x, tile.y]);
			});
		}
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerComponent; }
