//
//  GameBoardViewController.m
//  websocket-ios-demo
//
//  Created by Roman Barzyczak on 03.04.2014.
//  Copyright (c) 2014 Roman Barzyczak. All rights reserved.
//

#import "GameBoardViewController.h"
#import "SocketClient.h"
#import "PlayerView.h"


@interface GameBoardViewController ()

@property (strong, nonatomic) PlayerView *myPlayer;
@property (strong, nonatomic) SocketClient *socketClient;
@property (nonatomic, strong) NSMutableDictionary *players;

@end


@implementation GameBoardViewController

- (void) viewDidLoad {
    [super viewDidLoad];
    
    self.myPlayer = [[PlayerView alloc] initWithNick:self.nick];
    
    [self.players setObject:self.myPlayer forKey:self.nick];
    [self.view addSubview:self.myPlayer];
    self.socketClient = [[SocketClient alloc] initWithServerAdress:@"127.0.0.1" andPort:7878 andPlayerName:self.nick];
}

- (void) viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(updatePosition:) name:kBrainlyUpdatePosition object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(updateAllPosition:) name:kBrainlyAllPlayers object:nil];
    
    [self.socketClient connectEvent];
}

- (void) updateAllPosition:(NSNotification *) notif {
    NSArray *arr = notif.object;
    
    [arr enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
        [self updatePositionWithDictionary:obj];
    }];
}

- (void) updatePosition:(NSNotification *) notif {
    NSDictionary *dict = notif.object;
    [self updatePositionWithDictionary:dict];
}

- (void) updatePositionWithDictionary:(NSDictionary *)dict {
    
    
    NSString *nick = [dict objectForKey:@"name"];
    
    if(![self.players objectForKey:nick]) {
        UIView *playerView = [[PlayerView alloc] initWithNick:nick];
        playerView.frame = CGRectMake([[dict objectForKey:@"x"] floatValue], [[dict objectForKey:@"y"] floatValue], playerView.frame.size.width, playerView.frame.size.height);
        [self.players setObject:playerView forKey:nick];
        [self.view addSubview:playerView];
    } else {
        UIView *playerView = [self.players objectForKey:nick];
        playerView.frame = CGRectMake([[dict objectForKey:@"x"] floatValue], [[dict objectForKey:@"y"] floatValue], playerView.frame.size.width, playerView.frame.size.height);
    }
}

- (void) viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    
}

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event {
    
    UITouch *touch = [[event allTouches] anyObject];
    CGPoint touchLocation = [touch locationInView:self.view];
    
    touchLocation.x =50.0 * floor((touchLocation.x/50.0)+0.5);
    touchLocation.y = 50.0 * floor((touchLocation.y/50.0)+0.5);
    
    NSLog(@"change location to %@", NSStringFromCGPoint(touchLocation));
    
    [self.socketClient sendMoveToX:touchLocation.x andY:touchLocation.y];
    [self.myPlayer setPositionWithX:touchLocation.x andY:touchLocation.y];
}

- (NSMutableDictionary *) players {
    if(_players == nil) {
        _players = [[NSMutableDictionary alloc] init];
    }
    return _players;
}

@end
