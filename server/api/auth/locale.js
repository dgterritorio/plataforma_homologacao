export default async function (req, res, next) {
    console.log('--req change language');

    const params = req.body;

    if(req.session){
        const userid = req.session.userid ? req.session.userid : null;

        console.log('DXLogin.changeLanguage() Session ID = ' + userid);
    
        let lang = req.session.lang ? req.session.lang : 'en';
        
        if (params.lang) {
            console.log('Changing req.session.lang → ' + params.lang + ' from ' + lang);
            req.session.lang = params.lang;
            lang = req.session.lang;        
        }    
    }

    res.end();    
}
