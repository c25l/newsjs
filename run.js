const nodemailer = require('nodemailer');
const rss = require('rss-parser')
var fs = require('fs');
 
var config = JSON.parse(fs.readFileSync('/home/pi/newsjs/config.json', 'utf8'))
const start = new Date();

async function sendmail(msg) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: config.email_from,
      pass: config.pwd 
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: config.email_from, // sender address
    to: config.email_to, // list of receivers
    subject: "👻 Old news 👻", // Subject line
    text: "Best viewed in html, naturally.", // plain text body
    html: msg
  });
  console.log("Message sent: %s", info.messageId);
}

async function handle_site(sites){
  if(sites.length ==0){
    return ""
  }
  site = sites.shift()
  parser = new rss();
  feed = await parser.parseURL(site);
  return  "<div class=\"feed\">"+feed.title + "<br>\n" + handle_feed(feed.items)+ "</div>" + await handle_site(sites)
}

function handle_feed(items){
  if(items.length==0){
    return ""
  }
  var item = items.shift();
  var diff =start-Date.parse(item.pubDate); 
  if(diff < config.timeLag){
      return "<div class=\"item\"><a href=" + item.link +">"+item.title+"</a><br></div>\n" + handle_feed(items);
  }
  return handle_feed(items);
}

(async () => {
  out = await handle_site(config.sites);
  out=`<html><head><style>
div.feed {
  font-weight:bold;
  font-size:large;
  border: 2px grey;
  border-bottom-style: solid;
  padding: 1em;
}
div.item {
  font-weight:normal;
  font-size:medium;
  border: 1px lightgrey;
  border-left-style: solid;
  padding: 0.5em;
}
</style>
</head><body>` + out + "</body></html>";
  await sendmail(out)
  //console.log(out)
})()
