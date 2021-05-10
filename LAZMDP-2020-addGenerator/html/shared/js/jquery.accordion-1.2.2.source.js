(function($j){ 
     $j.fn.extend({  
         accordion: function(activeElement) {       
            return this.each(function() {
				if($j(this).data('accordiated'))
					return false;
				$j.each($j(this).find('ul.accordion, li>div'), function(){
					$j(this).data('accordiated', true);
					$j(this).hide();
				});
				$j.each($j(this).find('a:not(.foo)'), function(){
					$j(this).click(function(e){
						activate(e.target);
						return void(0);
					});
				});

				if(!activeElement) {
					if(location.hash)
						activeElement = $j(this).find('a[href=' + location.hash + ']')[0];
					else if($j(this).find('li.current'))
						activeElement = $j(this).find('li.current a')[0]; 
				}
				
				if(activeElement){
					activate(activeElement, 'toggle','parents');
					$j(activeElement).parents().show();
				}
				
				function activate(el,effect,parents){
					$j(el)[(parents || 'parent')]('li').toggleClass('active').siblings().removeClass('active').children('ul, div').slideUp('fast');
					$j(el).siblings('ul, div')[(effect || 'slideToggle')]((!effect)?'fast':null);
				}
				
            });
        } 
    }); 
})(jQuery);