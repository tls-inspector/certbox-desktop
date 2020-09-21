#import <Cocoa/Cocoa.h>
#import "CRFExportOptions.h"

@interface ExportOptionsViewController : NSViewController

- (void) getExportOptions:(void (^)(CRFExportOptions * options))finished;

@end
