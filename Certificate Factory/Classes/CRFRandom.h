#import <Foundation/Foundation.h>

@interface CRFRandom : NSObject

+ (NSString *)randomStringOfLength:(NSUInteger)length;
+ (NSUInteger) randomNumberBetween:(NSUInteger)from To:(NSUInteger)to;

@end
