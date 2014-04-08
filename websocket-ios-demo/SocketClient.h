//
//  SocketClient.h
//  websocket-ios-demo
//
//  Created by Roman Barzyczak on 03.04.2014.
//  Copyright (c) 2014 Roman Barzyczak. All rights reserved.
//

#import <Foundation/Foundation.h>

extern  NSString *const kBrainlyUpdatePosition;
extern  NSString *const kBrainlyAllPlayers;

@interface SocketClient : NSObject

- (id) initWithServerAdress:(NSString *)serverAdress andPort:(NSUInteger)serverPort andPlayerName:(NSString*)playerName;
- (void) connectEvent;
- (void) sendMoveToX:(int)x andY:(int)y;

@end
