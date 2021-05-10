var $j = jQuery.noConflict();

$j(document).ready(function () {
	
	    $j("a[rel^='prettyPhoto']").prettyPhoto({
	    	animationSpeed: 'fast',
	    	padding: 40,
	    	theme: 'dark_rounded'
	    });	    		    	
});
