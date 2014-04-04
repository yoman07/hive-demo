//
//  SocketClient.m
//  websocket-ios-demo
//
//  Created by Roman Barzyczak on 03.04.2014.
//  Copyright (c) 2014 Roman Barzyczak. All rights reserved.
//

#import "SocketClient.h"
#import <socket.IO/SocketIO.h>

@interface SocketClient() <SocketIODelegate>
@property (nonatomic, strong) SocketIO *socketIO;
@end

@implementation SocketClient

- (id) initWithServerAdress:(NSString *)serverAdress andPort:(NSUInteger)serverPort {
    self = [super init];
    if(self) {
         self.socketIO = [[SocketIO alloc] initWithDelegate:self];
        [self.socketIO connectToHost:serverAdress onPort:serverPort];
    }
    return self;
}

- (void) socketIODidConnect:(SocketIO *)socket {
    
}

- (void) socketIODidDisconnect:(SocketIO *)socket disconnectedWithError:(NSError *)error {
    
}
- (void) socketIO:(SocketIO *)socket didReceiveMessage:(SocketIOPacket *)packet {
    
}
- (void) socketIO:(SocketIO *)socket didReceiveJSON:(SocketIOPacket *)packet {
    
}
- (void) socketIO:(SocketIO *)socket didReceiveEvent:(SocketIOPacket *)packet {
    
}
- (void) socketIO:(SocketIO *)socket didSendMessage:(SocketIOPacket *)packet {
    
}
- (void) socketIO:(SocketIO *)socket onError:(NSError *)error {
    NSLog(@"Socket on error %@", error);
}


@end
