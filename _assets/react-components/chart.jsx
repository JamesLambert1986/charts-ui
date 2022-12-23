import chart from './_assets/js/modules/chart.js';
import { createChartKey, createChartType, deleteCellData, setCellData, createChartYaxis, createChartGuidelines, createLines, createPies } from './_assets/js/modules/chart.js';
/* Remove comments import './_assets/css/charts.scss'; */

function Chart(props) {

  const chartRef = useRef();

  useEffect(() => {

    const chartElement = chartRef.current;

    if(!chartElement.querySelector('.chart__key')){
      createChartKey(chartElement);
    }

    if(props.guidelines){
      createChartYaxis(chartElement, props.min, props.max, props.guidelines.split(','));
      createChartGuidelines(chartElement, props.min, props.max, props.guidelines.split(','));
    }
    
    deleteCellData(chartElement);
    setCellData(chartElement, props.min, props.max);

    // create lines
    if(chartElement.querySelector('.lines'))
      chartElement.querySelector('.lines').remove();
    if(props.type == "line")
      createLines(chartElement, props.min, props.max);

    // Create pies
    if(chartElement.querySelector('.pies'))
      chartElement.querySelector('.pies').remove();
    if(props.type == "pie")
      createPies(chartElement);

  });

  return (
    <figure className="chart" ref={chartRef}>
      <input type="radio" name="chart-type" value={props.type} defaultChecked></input>
      <div className="chart__inner">
        <div className="table__wrapper">
          {props.children}
        </div>
      </div>
    </figure>
  );
}