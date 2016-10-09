(function(){
    let permissions = ['manage_pages', 'pages_messaging','pages_messaging_subscriptions']
    let appId = "Your app Id";
    
    window.addEventListener("load",function(){
        document.getElementById("buttonLogin").addEventListener("click",function(e){

            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    showMyPages();
                }
                else {
                    FB.login(function(){
                        showMyPages();
                    },{scope:permissions});
                }
            });
        })
       
    });

    function loadPicture(page,callback){
        FB.api('/'+page.id+'/picture',(data)=>{
            callback(data.data.url);
        },{scope:permissions})
    }
    function showMyPages(){
        console.log("Show my pages");
        FB.api('/me/accounts',(resp)=>{
            console.log("pages",resp)
            let ul = document.getElementById("ulPages");
            for(let page of resp.data){
                //Check if user is adm in page
                let hasAdmPermission = page.perms.some((r)=>  r === "ADMINISTER");
                if(!hasAdmPermission)
                    continue;

                //Create elements(You can use whatever framework to render the html, but for simplicity, lets just use plai js)
                let li = document.createElement("li");
                let button = document.createElement("button");
                
                //Load page image(Optional)
                let image = document.createElement("img");
                loadPicture(page,function(picture){
                    console.log('page',page.id)
                    console.log("Loaded picture",page.id)
                    image.src = picture;
                })
                button.innerText = "Connect";
                //On click, connect to this page(User can have multiple pages)
                button.addEventListener("click",()=> connectTo(page));

                let text = document.createElement("span");
                text.innerHTML = page.name;
                li.appendChild(image);
                li.appendChild(text);
                li.appendChild(button);

                ul.appendChild(li);
            }

        },{scope:permissions})
    }
    function connectTo(page){
        console.log("connect to ",page)
        //Make a post request
        //To unsubscribe, make a delete request
        FB.api('/'+page.id+'/subscribed_apps','post',{scope:permissions,access_token:page.access_token},(r)=>{
            if(r.success){
                console.log('subscribed',r)
                alert('subscribed to page '+page.id+' with access_token '+page.access_token+'\n Use this access_token to send messages in messenger and use page_id to manage incoming messages')
            }else{
                alert('error');
                console.log('error in subscription',r.error)
            }
        })
    }
     
    // Load the SDK asynchronously
    (function(d, s, id) {
        let js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    
    window.fbAsyncInit = function() {
        FB.init({
            appId      : appId,
            cookie     : true,  // enable cookies to allow the server to access 
                                // the session
            xfbml      : true,  // parse social plugins on this page
            version    : 'v2.5' // use graph api version 2.5
        });
    };
})();