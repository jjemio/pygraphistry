import _ from 'underscore';
import SplitPane from 'react-split-pane';
import Visualization from './visualization';
import styles from './investigations.less';
import { Investigation, InvestigationHeader } from 'pivot-shared/investigations';


export default function InvestigationScreen({
    templates = [],
    investigations = [],
    activeInvestigation = {},
    selectInvestigation
}) {

    const { tags: activeTags = [] } = activeInvestigation || {};
    const relevantTemplates =
        activeTags.length > 0 ?
            templates.filter(({ tags: templateTags = [] }) =>
                _.intersection(templateTags, activeTags).length > 0
            ) :
            templates;

    return (
        <div className={styles['investigation-all']}>
            <div className={styles['investigation-split']}>
                <SplitPane split="vertical" minSize={0} defaultSize={375}>
                    <div>
                        <InvestigationHeader 
                            key={`investigation-header:${activeInvestigation.id}`}
                            activeInvestigation={activeInvestigation}
                            selectInvestigation={selectInvestigation}
                        />
                        <Investigation
                            key={`investigation:${activeInvestigation.id}`}
                            data={activeInvestigation}
                            investigations={investigations}
                            templates={relevantTemplates}
                            selectInvestigation={selectInvestigation}
                        />
                    </div>
                    { activeInvestigation.status &&
                        <Visualization investigation={activeInvestigation}/>
                        || undefined
                    }
               </SplitPane>
            </div>
        </div>
    );
}
