// Original by Luis Perez
// From blog post: http://www.simplygoodcode.com/2014/04/angularjs-getting-around-ngapp-limitations-with-ngmodule/

(function() {
  function initNgModules(element) {
      var i, j,
          elements = [element],
          moduleElements = [],
          modules = [],
          names = ['ng:module', 'ng-module', 'x-ng-module', 'data-ng-module', 'ng:modules', 'ng-modules', 'x-ng-modules', 'data-ng-modules'],
          NG_MODULE_CLASS_REGEXP = /\sng[:\-]module[s](:\s*([\w\d_]+);?)?\s/;

      function append(element) {
          element && elements.push(element);
      }

      for(i = 0; i < names.length; i++) {
          var name = names[i];
          append(document.getElementById(name));
          name = name.replace(':', '\\:');
          if (element.querySelectorAll) {
              var elements2;
              elements2 = element.querySelectorAll('.' + name);
              for(j = 0; j < elements2.length; j++) append(elements2[j]);

              elements2 = element.querySelectorAll('.' + name + '\\:');
              for(j = 0; j < elements2.length; j++) append(elements2[j]);

              elements2 = element.querySelectorAll('[' + name + ']');
              for(j = 0; j < elements2.length; j++) append(elements2[j]);
          }
      }

      for(i = 0; i < elements.length; i++) {
          element = elements[i];

          var className = ' ' + element.className + ' ';
          var match = NG_MODULE_CLASS_REGEXP.exec(className);
          if (match) {
              moduleElements.push(element);
              modules.push((match[2] || '').replace(/\s+/g, ','));
          } else {
              if(element.attributes) {
                  for(j = 0; j < element.attributes.length; j++) {
                      var attr = element.attributes[j];

                      if (names.indexOf(attr.name) != -1) {
                          moduleElements.push(element);
                          modules.push(attr.value);
                      }
                  }
              }
          }
      }

      if(modules.length == 0) return;

      modules = modules.reduce(function(deps, moduleExpr) {
            return deps.concat( moduleExpr.replace(/ /g,'').split(",") )
      }, []);


      angular.bootstrap(findCommonAncestor(moduleElements), modules, { strictDi: true });
  }

  function findCommonAncestor(elements) {
      var ancestor = elements[0];
      while(ancestor = ancestor.parentElement) {
          var isShared = elements.every(function(element) { return ancestor.contains(element) });
          if(isShared) {
              return ancestor;
          }
      }

      return document.body;
  }

  angular.element(document).ready(function() {
        initNgModules(document);
  });
})();
