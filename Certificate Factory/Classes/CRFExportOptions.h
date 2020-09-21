#import <Foundation/Foundation.h>

@interface CRFExportOptions : NSObject

typedef NS_ENUM(NSUInteger, CFFactoryExportType) {
    EXPORT_PEM,
    EXPORT_PKCS12,
};

@property (strong, nonatomic, nonnull) NSString * exportPassword;
@property (nonatomic) CFFactoryExportType exportType;
@property (nonatomic) BOOL encryptKey;

@end
