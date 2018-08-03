
var Constants = {};

Constants.userNameTest1   = 'bot.test1';

Constants.keyPath             = '/home/ec2-user/environment/sh/symphony/symphony_privatekey.pem';
Constants.urlSessionToken     = 'https://mizuho-banking-test.symphony.com:443/login/pubkey/authenticate';
Constants.urlKmToken          = 'https://mizuho-banking-test.symphony.com:443/relay/pubkey/authenticate';
Constants.urlRoomBase         = 'https://mizuho-banking-test.symphony.com/pod/v2/room/';
Constants.urlRoomInfo         = '/info';
Constants.urlStream           = 'https://mizuho-banking-test.symphony.com:443/agent/v4/stream/';
Constants.urlCreateMessage    = '/message/create';
Constants.urlDatafeedRoot     = 'https://mizuho-banking-test.symphony.com/agent/v4/datafeed/';
Constants.urlCreate           = 'create';
Constants.urlRead             = '/read';

Constants.pathSymphonyClient  = '../module/SymphonyClient';
Constants.pathChatCallbacks   = '../module/ChatCallbacks';

Constants.pugIndex            = 'index';

Constants.msgTitle            = 'Symphony Bot';

module.exports = Constants;