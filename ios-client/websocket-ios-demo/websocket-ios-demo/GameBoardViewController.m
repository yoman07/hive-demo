//
//  GameBoardViewController.m
//  websocket-ios-demo
//
//  Created by Roman Barzyczak on 03.04.2014.
//  Copyright (c) 2014 Roman Barzyczak. All rights reserved.
//

#import "GameBoardViewController.h"
#import "SocketClient.h"


@interface GameBoardViewController ()

@property (weak, nonatomic) IBOutlet UIView *photoContainer;
@property (strong, nonatomic) SocketClient *socketClient;

@end


@implementation GameBoardViewController

- (void) viewDidLoad {
    [super viewDidLoad];
    self.socketClient = [[SocketClient alloc] initWithServerAdress:@"127.0.0.1" andPort:7878];

}

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event {
    
    UITouch *touch = [[event allTouches] anyObject];
    CGPoint touchLocation = [touch locationInView:self.view];
    
    self.photoContainer.center = touchLocation;
}


@end
