//
//  PlayerView.h
//  websocket-ios-demo
//
//  Created by Roman Barzyczak on 07.04.2014.
//  Copyright (c) 2014 Roman Barzyczak. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface PlayerView : UIView

- (void) setPositionWithX:(CGFloat)x andY:(CGFloat)y;
- (id)initWithNick:(NSString *)nick;
@end
