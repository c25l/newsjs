const nodemailer = require('nodemailer');
const rss = require('rss-parser')
var fs = require('fs');
 
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
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
    html: msg // html body
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
  return  "<hr><br>"+feed.title + "<br><hr>\n" + handle_feed(feed.items) + await handle_site(sites)
}

function handle_feed(items){
  if(items.length==0){
    return ""
  }
  var item = items.shift();
  var diff =start-Date.parse(item.pubDate); 
  if(diff < config.timeLag){
      return "<a href=" + item.link +">"+item.title+"</a><br><hr>\n" + handle_feed(items);
  }
  return handle_feed(items);
}

(async () => {
  out = await handle_site(config.sites);
  await sendmail(out)
})()