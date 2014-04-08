//
//  ViewController.m
//  websocket-ios-demo
//
//  Created by Roman Barzyczak on 03.04.2014.
//  Copyright (c) 2014 Roman Barzyczak. All rights reserved.
//

#import "ViewController.h"
#import "GameBoardViewController.h"

@interface ViewController ()
@property (weak, nonatomic) IBOutlet UITextField *nickTextField;

@end

@implementation ViewController

-(void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender{
    if([segue.identifier isEqualToString:@"showBoardGame"]){
        GameBoardViewController *controller = (GameBoardViewController *)segue.destinationViewController;
        controller.nick = self.nickTextField.text;
    }
}

@end
