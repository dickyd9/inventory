import { BadRequestException, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import jsConvert, { toHeaderCase } from 'js-convert-case';
import * as tmp from 'tmp';

@Injectable()
export class ExportService {
  async exportExcel(data: any, res: any) {
    const rows = [];

    // Array was called as a function. It has method 'forEach' to iterate.
    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });

    const book = new Workbook();
    const sheet = book.addWorksheet(`sheet1`);
    rows.unshift(Object.keys(data[0]).map((e) => jsConvert.toHeaderCase(e)));
    sheet.addRows(rows);
    this.styleSheet(sheet);

    const File = await new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: `Export`,
          postfix: `.xlsx`,
          mode: parseInt(`0600`, 8),
        },
        async (err, file) => {
          if (err) throw new BadRequestException(err);

          book.xlsx
            .writeFile(file)
            .then((_) => {
              resolve(file);
            })
            .catch((err) => {
              throw new BadRequestException(err);
            });
        },
      );
    });

    res.download(`${File}`);
  }

  private styleSheet(sheet) {
    // sheet.getColumn(1).width = 20.5;
    // sheet.getColumn(2).width = 20.5;

    // sheet.getRow(1).height = 30.5;

    // sheet.getRow(1).font = {
    //   size: 11.5,
    //   bold: true,
    //   color: { argb: 'FFFFFF' },
    // };

    // sheet.getRow(1).fill = {
    //   type: 'pattern',
    //   pattern: 'solid',
    //   bgColor: { argb: '000000' },
    //   fgColor: { argb: '000000' },
    // };

    // sheet.getRow(1).alignment = {
    //   vertical: 'middle',
    //   horizontal: 'center',
    //   wrapText: true,
    // };

    // sheet.getRow(1).border = {
    //   top: { style: 'thin', color: { argb: '000000' } },
    //   left: { style: 'thin', color: { argb: 'ffffff' } },
    //   right: { style: 'thin', color: { argb: '000000' } },
    //   bottom: { style: 'thin', color: { argb: 'ffffff' } },
    // };

    sheet.eachRow(function (row, rowNumber) {
      row.eachCell((cell, colNumber) => {
        if (rowNumber == 1) {
          // First set the background of header row
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'f5b914' },
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
          };
        }

        // Set border of each cell
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      //Commit the changed row to the stream
      row.commit();
    });
  }
}
