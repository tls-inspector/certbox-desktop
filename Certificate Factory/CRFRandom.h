#import <Foundation/Foundation.h>

@interface CRFRandom : NSObject

+ (NSString *) randomString;
+ (NSUInteger) randomNumberBetween:(int)from To:(int)to;

@end
