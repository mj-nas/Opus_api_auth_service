import { XpsService } from '@core/xps';
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ApiErrorResponses } from 'src/core/core.decorators';
import { Job } from 'src/core/core.job';
import { ErrorResponse, Result } from 'src/core/core.responses';
import { Public } from 'src/core/decorators/public.decorator';
import { CommonService } from './common.service';
import { CreatePresignedUrl } from './create-presigned-url.dto';

@ApiTags('common')
@ApiBearerAuth()
@ApiErrorResponses()
@Controller('common')
export class CommonController {
  constructor(
    private commonService: CommonService,
    private _xpsService: XpsService,
  ) {}

  @Post('presigned-url')
  @Public()
  @ApiOperation({ summary: 'To create presigned url for s3' })
  async putObject(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createPresignedUrl: CreatePresignedUrl,
  ) {
    const { error, signedUrl } = await this.commonService.getSignedURL(
      new Job({
        payload: {
          operation: 'putObject',
          params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: createPresignedUrl.key,
            Expires: 60 * 60 * 36,
            region: process.env.AWS_REGION,
          },
        },
      }),
    );
    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { signed_url: signedUrl },
      message: 'Ok',
    });
  }

  @Get('sample')
  @Public()
  @ApiOperation({ summary: 'Sample API' })
  async sample(@Req() req: Request, @Res() res: Response) {
    const senderObj = {
      name: 'Albert Jones',
      company: 'Jones Co.',
      address1: '123 Some Street',
      address2: '#54',
      city: 'Holladay',
      state: 'UT',
      zip: '84117',
      country: 'US',
      phone: '8015042351',
      email: 'albert@jones.egg',
    };
    // const packageWeight = items.reduce(
    //   (sum, item) => sum + item.product.weight_lbs,
    //   0,
    // );
    //ship product

    const items = [
      {
        product: {
          id: '1',
          slug: 'product-1',
          product_name: 'Product 1',
          price: '100',
          quantity: '1',
          weight_lbs: '1',
          height: '1',
          width: '1',
          length: '1',
          product_image: 'https://via.placeholder.com/150',
        },
      },
      {
        product: {
          id: '2',
          slug: 'product-2',
          product_name: 'Product 2',
          price: '200',
          quantity: '1',
          weight_lbs: '2',
          height: '2',
          width: '2',
          length: '2',
          product_image: 'https://via.placeholder.com/150',
        },
      },
    ];

    await this._xpsService.createShipment({
      payload: {
        order_id: 'Oerder123',
        orderDate: new Date().toISOString(),
        orderNumber: null,
        fulfillmentStatus: 'pending',
        shippingService: null,
        shippingTotal: null,
        weighUnit: 'lb',
        dimUnit: 'in',
        dueByDate: null,
        orderGroup: null,
        // contentDescription: 'Opus products',
        sender: senderObj,
        receiver: {
          name: 'username',
          address1: 'useraddress',
          city: 'usercity',
          state: 'userstate',
          zip: 'userzip_code',
          country: 'usercountry',
          phone: 'userphone',
          email: 'useremail',
        },
        items: items.map((item) => ({
          productId: item.product.id,
          sku: item?.product.slug,
          title: item.product?.product_name,
          price: item.product?.price,
          quantity: item.product?.quantity,
          weight: item.product?.weight_lbs,
          height: item.product?.height,
          width: item.product?.width,
          length: item.product?.length,
          imgUrl: item.product?.product_image,
        })),
        packages: items.map((item) => ({
          weight: item.product.weight_lbs,
          height: item.product.height,
          width: item.product.width,
          length: item.product.length,
          insuranceAmount: null,
          declaredValue: null,
        })),
      },
    });
    return Result(res, {
      data: { message: 'Sample API' },
      message: 'Ok',
    });
  }
}
