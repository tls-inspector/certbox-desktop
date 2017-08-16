#import <Foundation/Foundation.h>
#import "SANObject.h"

@interface CRFFactoryOptions : NSObject

typedef NS_ENUM(NSUInteger, CFFactoryKeyAlgType) {
    KEY_ALG_RSA,
    KEY_ALG_ECDSA,
};

typedef NS_ENUM(NSUInteger, CFFactoryExportType) {
    EXPORT_PEM,
    EXPORT_PKCS12,
};

@property (strong, nonatomic, nonnull) NSString * serial;
@property (nonatomic) CFFactoryKeyAlgType keyType;
@property (nonatomic) CFFactoryExportType exportType;
@property (strong, nonatomic, nonnull) NSDate * dateStart;
@property (strong, nonatomic, nonnull) NSDate * dateEnd;
@property (strong, nonatomic, nonnull) NSString * country;
@property (strong, nonatomic, nonnull) NSString * state;
@property (strong, nonatomic, nonnull) NSString * city;
@property (strong, nonatomic, nonnull) NSString * organization;
@property (strong, nonatomic, nonnull) NSString * department;
@property (strong, nonatomic, nonnull) NSString * commonName;
@property (strong, nonatomic, nonnull) NSArray<SANObject *> * sans;
@property (strong, nonatomic, nonnull) NSString * exportPassword;

@end
