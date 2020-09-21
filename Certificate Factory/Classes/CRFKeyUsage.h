#import <Foundation/Foundation.h>

@interface CRFKeyUsage : NSObject

@property (strong, nonatomic, nonnull, readonly) NSString * value;
@property (nonatomic) BOOL extended;

+ (CRFKeyUsage * _Nonnull) usageWithValue:(NSString * _Nonnull)value extended:(BOOL)extended;

@end
