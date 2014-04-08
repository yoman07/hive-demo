//
//  SocketClient.m
//  websocket-ios-demo
//
//  Created by Roman Barzyczak on 03.04.2014.
//  Copyright (c) 2014 Roman Barzyczak. All rights reserved.
//

#import "SocketClient.h"
#import <socket.IO/SocketIO.h>
#import <socket.IO/SocketIOPacket.h>

@interface SocketClient() <SocketIODelegate>
@property (nonatomic, strong) SocketIO *socketIO;
@property (nonatomic, strong) NSString *playerName;
@property (nonatomic, strong) NSDictionary *onEventDictionary;
@end


NSString *const kBrainlyUpdatePosition = @"com.brainly.websocket.new.position";
NSString *const kBrainlyAllPlayers = @"com.brainly.websocket.all.players";

typedef void (^CaseBlock)(NSDictionary *packetData);

@implementation SocketClient

- (id) initWithServerAdress:(NSString *)serverAdress andPort:(NSUInteger)serverPort andPlayerName:(NSString*)playerName{
    self = [super init];
    if(self) {
         self.socketIO = [[SocketIO alloc] initWithDelegate:self];
        [self.socketIO connectToHost:serverAdress onPort:serverPort];
        self.playerName = playerName;
       self.onEventDictionary = @{
                            @"player.all":
                                ^(NSDictionary *dict){
                                    [[NSNotificationCenter defaultCenter] postNotificationName:kBrainlyAllPlayers object:[dict objectForKey:@"args"][0]];
                                    NSLog(@"Riches! %@", dict);
                                },
                            @"player.bye":
                                ^(NSDictionary *dict){
                                    NSLog(@"player.bye %@!", dict);
                                },
                            @"player.update":
                                ^(NSDictionary *dict){
                                    [[NSNotificationCenter defaultCenter] postNotificationName:kBrainlyUpdatePosition object:[dict objectForKey:@"args"][0]];
                                    NSLog(@"player.update %@", dict);
                                }
                            };
    }
    return self;
}

- (void) socketIO:(SocketIO *)socket didReceiveEvent:(SocketIOPacket *)packet {
    NSString* str = packet.data;
    NSData* data=[str dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error = nil;
    
    NSDictionary *dataDictionary = [NSJSONSerialization
                                    JSONObjectWithData:data
                                    options:NSJSONReadingMutableLeaves
                                    error:&error];
    
    ((CaseBlock)self.onEventDictionary[packet.name])(dataDictionary); // invoke the correct block of code
    
    
    NSLog(@"receive event %@ with %@", packet.name, dataDictionary);
    
}

- (void) connectEvent {
    [self.socketIO sendEvent:@"player.new" withData:@{@"name": self.playerName,
                                                      @"color": @"#cd842d",
                                                      @"x" : @(50),
                                                      @"y" : @(300)}];
}

- (void) sendMoveToX:(int)x andY:(int)y {
    [self.socketIO sendEvent:@"player.move" withData:@{@"name": self.playerName,
                                                      @"color": @"#cd842d",
                                                      @"x" : @(x),
                                                      @"y" : @(y)}];
}


@end
