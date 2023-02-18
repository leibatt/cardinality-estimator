

const quantitativeExtent = "SELECT MIN([field]) as minval, MAX([field]) as maxval FROM [table]";
const totalCount = "SELECT COUNT(*) FROM [table]";
const quantitativeHistogram = "SELECT FLOOR(([field] - [min]) / [step]) as bin_id, COUNT(*) as count FROM [table] GROUP BY bin_id ORDER BY bin_id";
const nominalCardinality = "SELECT [field], COUNT(*) as count FROM [table] GROUP BY [field]";


export enum DataType {
  nominal = "nominal", // string types or discrete types with low expected cardinality
  quantitative = "quantitative", // numeric types where it makes sense to compute aggregate stats
  temporal = "temporal" // date types
}

// allows us to reason about the fields being estimated
export class Field {
  name: string;
  tableName: string;
  dataType: DataType;
  //histogram?: NominalHistogram | QuantitativeHistogram
}

export class QuantitativeHistogram {
  histogram: number[]; // count per quantitative bin
  extent: number[]; // min and max
  total: number; //  TODO: should this be table size? Or total non-null values for this field?
  field: Field; // column to compute histogram on
  conn: string; // TODO: add type
  config: Record<string, number>;

  constructor(conn: string, field: Field, config: Record<string, number>) {
    this.conn = conn;
    this.field = field;
    this.config = config;
  }

  build() {
    // calculate extent
    let extentQuery: string = quantitativeExtent.replace("[table]", this.field.tableName);
    extentQuery = extentQuery.replace("[field]",this.field.name);
    const extentResults: Record<string, any>[] = executeQuery(this.conn,extentQuery); // first row?
    this.extent = [extentResults[0].minval, extentResults[0].maxval];
    
    // setup binning parameters
    if(this.config.bins === undefined) {
        if(this.config.step === undefined) {
          this.config.bins = 30; // TODO: move to parameter
          this.config.step = 1.0 * (this.extent[1] - this.extent[0]) / this.config.bins;
        } else {
          // TODO: round up
          this.config.bins = Math.round(1.0 * (this.extent[1] - this.extent[0]) / this.config.step);
        }
    }
    let qhquery = quantitativeHistogram.replace("[field]",this.field.name)
      .replace("[step]",""+this.config.step);
    qhquery = qhquery.replace("[table]",this.field.tableName)
      .replace("[min]",""+this.extent[0]);

    const results: Record<string, any>[] = executeQuery(this.conn,qhquery);
    this.histogram = results.map(r => r.count);
    this.total = this.histogram.reduce((a,v) => a + v, 0);
  }

  selectivityForThreshold(direction: string, threshold: number) {
    if(direction === "<") {
      return this.selectivityForRange(this.extent[0],threshold);
    } else {
      return this.selectivityForRange(threshold,this.extent[1]);
    }
  }

  selectivityForRange(lower: number, upper: number): number {
    const lbin = Math.floor((1.0 * lower - this.extent[0]) / this.config.step);
    const ubin = Math.floor((1.0 * upper - this.extent[0]) / this.config.step);
    if(lbin === ubin) {
      return 1.0 * this.histogram[lbin] / this.total;
    }
    return 1.0 * this.histogram.slice(lbin,ubin+1).reduce((a,v) => a+v, 0) / this.total;
  }

  selectivityForValue(value: number): number {
    const bin = Math.floor((1.0 * value - this.extent[0]) / this.config.step);
    return 1.0 * this.histogram[bin] / this.total;
  }
}

function executeQuery(conn: string, query: string): Record<string, any>[] {
  //const results = conn.execute(query);
  // TODO: fill in
  return [];
}

