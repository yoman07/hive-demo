//
//  PlayerView.m
//  websocket-ios-demo
//
//  Created by Roman Barzyczak on 07.04.2014.
//  Copyright (c) 2014 Roman Barzyczak. All rights reserved.
//

#import "PlayerView.h"
#import <UIImage+animatedGif/UIImage+animatedGIF.h>

@interface PlayerView ()

@property (nonatomic, strong) UILabel *nickLabel;

@end

@implementation PlayerView

- (id)initWithNick:(NSString *)nick {
    self = [super initWithFrame:CGRectMake(50, 50, 50, 50)];
    if(self) {
        
        NSURL *url = [[NSBundle mainBundle] URLForResource:@"ogame-r" withExtension:@"gif"];
        
        
        UIImageView *owlView = [[UIImageView alloc] initWithImage:[UIImage animatedImageWithAnimatedGIFData:[NSData dataWithContentsOfURL:url]]];
        owlView.frame = CGRectMake(5, 0, 40, 40);
        
        [self addSubview:owlView];
        self.nickLabel = [[UILabel alloc] initWithFrame:CGRectMake(0, 41, 50, 12)];
        [self.nickLabel setFont:[UIFont systemFontOfSize:9]];
        self.nickLabel.text = nick;
        [self addSubview:self.nickLabel];
    }
    return self;
}


- (void) setPositionWithX:(CGFloat)x andY:(CGFloat)y {
    self.frame = CGRectMake(x, y, self.frame.size.width, self.frame.size.height);
}

@end
