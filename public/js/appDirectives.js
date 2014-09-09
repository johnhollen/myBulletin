//Directive for making elements draggable.
angular.module('drag', []).
  directive('draggable', function($document) {

    return function(scope, element, attr) {

      var startX = 0, startY = 0, x, y;

      //If statement checking what kind of object is clicked
      if(scope.hasOwnProperty('sticky')){
        x = scope.sticky.positionX;
        y = scope.sticky.positionY;
      }
      else if(scope.hasOwnProperty('youtube')){
        x = scope.youtube.positionX;
        y = scope.youtube.positionY;
      }
      else if(scope.hasOwnProperty('image')){
        x = scope.image.positionX;
        y = scope.image.positionY;
      }

      element.css({
        top: y + 'px',
        left: x + 'px'
      });

      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.screenX - x;
        startY = event.screenY - y;

        element.css({
          'z-index': 2,
          '-webkit-box-shadow': 1+'px '+ 2+'px '+ 1+'px '+ 2+'px '+ '#666',
          'box-shadow': 1+'px '+ 2+'px '+ 1+'px '+ 2+'px '+ '#666',
          '-moz-box-shadow': 1+'px '+ 2+'px '+ 1+'px '+ 2+'px '+ '#666'
        });

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.screenY - startY;
        x = event.screenX - startX;

        if(x <= 0){
          x = 0;
        }
        if(x >= 655){
          x = 655;
        }
        if(y <= 40)
        {
          y = 40;
        }
        if(y >= 435){
          y = 435;
        }

        element.css({
          top: y + 'px',
          left:  x + 'px',
        });
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);

        element.css({
          'z-index': 1,
          '-webkit-box-shadow': 'none',
          'box-shadow': 'none',
          '-moz-box-shadow': 'none'
        });

        if(scope.hasOwnProperty('sticky')){
          scope.sticky.positionX = x;
          scope.sticky.positionY = y;
          scope.updateObjectCoords(scope.sticky);
        }
        else if(scope.hasOwnProperty('youtube')){
          scope.youtube.positionX = x;
          scope.youtube.positionY = y;
          scope.updateObjectCoords(scope.youtube);
        }
        else if(scope.hasOwnProperty('image')){
          scope.image.positionX = x;
          scope.image.positionY = y;
          scope.updateObjectCoords(scope.image);
        }
      }
    };
  });

  /*angular.module('fileUpload', []).directive('fileupload', function () {
    return {
        scope: true,       //create a new scope
        link: function (scope, element, attrs) {
          console.log(scope);
          console.log(element);
          console.log(attrs);
            element.bind('change', function (event) {
                var files = event.target.files;
                console.log(event);
                //iterate files since 'multiple' may be specified on the element
                for (var i = 0;i<files.length;i++) {
                    //emit event upward
                    scope.$emit("fileSelected", { file: files[i] });
                }
            });
        }
    };
  });*/
