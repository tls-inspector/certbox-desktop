#import <Foundation/Foundation.h>
#import "CRFFactoryOptions.h"

@interface CRFFactory : NSObject

+ (CRFFactory * _Nonnull) factoryWithOptions:(CRFFactoryOptions * _Nonnull)options;
- (void) generateAndSave:(void (^ _Nonnull)(NSString * _Nullable savePath, NSError * _Nullable error))finished;

@end
