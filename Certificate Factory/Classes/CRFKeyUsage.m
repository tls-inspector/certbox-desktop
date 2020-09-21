#import "CRFKeyUsage.h"

@interface CRFKeyUsage ()

@property (strong, nonatomic, nonnull, readwrite) NSString * value;

@end

@implementation CRFKeyUsage

+ (CRFKeyUsage *) usageWithValue:(NSString *)value extended:(BOOL)extended {
    CRFKeyUsage * usage = [CRFKeyUsage new];

    usage.value = value;
    usage.extended = extended;

    return usage;
}

@end
