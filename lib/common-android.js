#import 'sandbox.js'

var com = {};
com.animal = {
  exportWithFactors: function(factors) {
    if ([selection count] == 0) {
      [doc showMessage:"No layer is selected."];
    } else {
      var openDlg = [NSOpenPanel openPanel];

      // Enable the selection of files in the dialog.
      [openDlg setCanChooseFiles:false];
      [openDlg setCanChooseDirectories:true];
      [openDlg setAllowsMultipleSelection:false];
      [openDlg setCanCreateDirectories: true];
      [openDlg setPrompt:"Select"];

      if ( [openDlg runModalForDirectory:nil file:nil] == NSOKButton ) {

        for (var j=0; j < [selection count]; j++) {

          var layer = [selection objectAtIndex:j];
          var parent =  ([layer parentArtboard]) ? [layer parentArtboard] : [doc currentPage];
          var layerVisibility = [];

          [parent deselectAllLayers];

          var layerArray = [layer];
          [parent selectLayers:layerArray];

          var root = parent;

          var hideLayers = function(root, target) {
            // Hide all layers except for selected and store visibility
            for (var k=0; k < [[root layers] count]; k++) {
              var currentLayer = [[root layers] objectAtIndex:k];
              if ([currentLayer containsSelectedItem] && currentLayer != target) {
                hideLayers(currentLayer, target);
              } else if (!(currentLayer == target)) {
                var dict = {
                   "layer": currentLayer,
                   "visible": [currentLayer isVisible]
                };

                layerVisibility.push(dict);
                [currentLayer setIsVisible: false];
              }
            }
          }

          hideLayers(root, layer);

          var rect = [[layer absoluteRect] rect];
          var path = [[[openDlg URLs] objectAtIndex:0] fileSystemRepresentation];

          new AppSandbox().authorize(path, function() {
            for (var f=0; f < factors.length; f++) {
              var factor = factors[f];
              slice = [MSExportRequest requestWithRect:rect scale:factor["scale"]];
              
              var layerName = [layer name];
              if (layerName.indexOf("/") > -1) {
		              var elements = layerName.split("/");
		              var fileName = elements.pop();
		              var layerPath = elements.join("/");
                  [doc saveArtboardOrSlice:slice toFile:path + "/" + layerPath + "/" + factor["name"] + "/" + fileName + ".png"];
              }
              else {
                [doc saveArtboardOrSlice:slice toFile:path + "/" + factor["name"] + "/" + [layer name] + ".png"];
              }
            }
          });

          // Restore layers visibility
          for (var m=0; m < layerVisibility.length; m++) {
            var dict   = layerVisibility[m];
            layer      = dict.layer;
            visibility = dict.visible;

            if (visibility == 0) {
              [layer setIsVisible:false];
            } else {
              [layer setIsVisible:true];
            }
          }

          // Restore selection
          [parent selectLayers:selection];

        }
        [doc showMessage: [selection count] + " layers exported to " + path];
      }
    }
  }
}
