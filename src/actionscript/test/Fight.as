package test
{
   import flash.display.Loader;
   import flash.display.LoaderInfo;
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.net.URLRequest;
   
   public class Fight extends Sprite
   {
      private static var ROOT:String = "";
      
      public function Fight()
      {
         var params:Object;
         var loader:Loader;
         super();
         params = LoaderInfo(this.root.loaderInfo).parameters;
         loader = new Loader();
         loader.contentLoaderInfo.addEventListener("complete",function(event:Event):void
         {
            var domain:* = loader.contentLoaderInfo.applicationDomain;
            var pet:MovieClip = new (domain.getDefinition("pet") as Class)();
            addChild(pet);
            if(params["x"])
            {
               pet.scaleX = -1;
               pet.x = pet.width;
            }
            pet.gotoAndStop(params["label"] || "待机");
         });
         loader.load(new URLRequest(ROOT + (params["url"] || "31.swf")));
      }
   }
}

