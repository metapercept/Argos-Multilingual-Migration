<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs"
    version="2.0">
    
    <!--<xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes"/>-->
    
    
    <xsl:strip-space elements="*"/>
    
    <xsl:character-map name="isolat1">
        <xsl:output-character character="&#x2019;" string="&amp;#x2019;"/>
        <xsl:output-character character="&#x201c;" string="&amp;#x201c;"/>
        <xsl:output-character character="&#x201d;" string="&amp;#x201d;"/>
        <xsl:output-character character="&#x00a7;" string="&amp;#x00a7;"/>
        <xsl:output-character character="&#x2003;" string="&amp;#x2003;"/>
        <xsl:output-character character="&#x2013;" string="&amp;#x2013;"/>
        <xsl:output-character character="&#x2018;" string="&amp;#x2018;"/>
        <xsl:output-character character="&#x2014;" string="&amp;#x2014;"/>
        <xsl:output-character character="&#x2212;" string="&amp;#x2212;"/>
        <xsl:output-character character="&#x0026;" string="&amp;#x0026;"/>
        <xsl:output-character character="&#x25A0;" string="&amp;#x25A0;"/>
        <xsl:output-character character="&#x261B;" string="&amp;#x261B;"/>
        <xsl:output-character character="&lt;" string="&amp;lt;"/>
        <xsl:output-character character="&gt;" string="&amp;gt;"/>
        <xsl:output-character character="&#x27A4;" string="&amp;#x27A4;"/>
        <xsl:output-character character="&#xa0;" string="&amp;#xa0;"/>
        <xsl:output-character character="&#xe0;" string="&amp;#xe0;"/>
        <xsl:output-character character="&#xb6;" string="&amp;#xb6;"/>
        <xsl:output-character character="&#x2026;" string="&amp;#x2026;"/>
        <xsl:output-character character="&#xbd;" string="&amp;#xbd;"/>
        <xsl:output-character character="&#xbd;" string="&amp;#xbd;"/>
        <xsl:output-character character="&#x2022;" string="&amp;#x2022;"/>
        <xsl:output-character character="&#x2002;" string="&amp;#x2002;"/>
        <xsl:output-character character="&#x200A;" string="&amp;#x200A;"/>
    </xsl:character-map>
    
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
    
    
    <!--<xsl:template match="*/text()[normalize-space()]">
        <xsl:value-of select="normalize-space()"/>
    </xsl:template>
    
    <xsl:template match="*/text()[not(normalize-space())]" />-->
    
    
    
    
    <xsl:template match="ROOT">
        <topics uri="{substring-after(base-uri(), 'xmlExport/')}">
            <xsl:apply-templates/>
        </topics>
    </xsl:template>
    
    <!--Headings-->
    
    <xsl:template match="Heading-1|Heading-1-DIA-HYD">
        <topic type="1">
            <title><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    <xsl:template match="Heading-2">
        <topic type="2">
            <title><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    <xsl:template match="Heading-3">
        <topic type="3">
            <title><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    <xsl:template match="Heading-4">
        <topic type="4">
            <title><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    <xsl:template match="Heading-5">
        <topic type="5">
            <title><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    <xsl:template match="Heading-6">
        <topic type="6">
            <title><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    
    <!--Event Code headings-->
    <xsl:template match="EC-Heading-1">
        <topic type="1" id="event-code">
            <title><xsl:text>Event Code </xsl:text><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    <xsl:template match="EC-Heading-2">
        <topic type="2" id="event-code">
            <title><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    <xsl:template match="EC-Heading-3">
        <topic type="3" id="event-code">
            <title><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    <xsl:template match="EC-Heading-4">
        <topic type="4" id="event-code">
            <title><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    <xsl:template match="EC-Heading-5">
        <topic type="5" id="event-code">
            <title><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    
    <xsl:template match="Body">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    
    <xsl:template match="Bold">
        <b>
            <xsl:apply-templates/>
        </b>
    </xsl:template>
    
    <xsl:template match="Emphasis">
        <i>
            <xsl:apply-templates/>
        </i>
    </xsl:template>
    
    <xsl:template match="superscript">
        <sup>
            <xsl:apply-templates/>
        </sup>
    </xsl:template>
    
    <xsl:template match="subscript">
        <sub>
            <xsl:apply-templates/>
        </sub>
    </xsl:template>
    
    
    <!--Table-->
    <xsl:template match="TABLE">
        <table>
            <xsl:apply-templates/>
        </table>
    </xsl:template>
    
    <xsl:template match="ROW">
        <row>
            <xsl:apply-templates/>
        </row>
    </xsl:template>
    
    <xsl:template match="TH">
        <entry type="thead">
            <xsl:if test="@ROWSPAN">
                <xsl:choose>
                    <xsl:when test="@ROWSPAN='1'"/>
                    <xsl:otherwise>
                        <xsl:attribute name="rowspan">
                            <xsl:value-of select="@ROWSPAN"/>
                        </xsl:attribute>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:if>
            <xsl:if test="@COLSPAN">
                <xsl:choose>
                    <xsl:when test="@COLSPAN='1'"/>
                    <xsl:otherwise>
                        <xsl:attribute name="colspan">
                            <xsl:value-of select="@COLSPAN"/>
                        </xsl:attribute>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:if>
            <xsl:choose>
                <xsl:when test="child::TableTitle-white-Center|child::TableTitle-black-Center|child::TableText-Center-Middle|child::TableText-Middle|child::TableText-Center|child::TableTitle-white-Center">
                    <xsl:attribute name="align">center</xsl:attribute>
                </xsl:when>
                <xsl:when test="child::TableTitle-black-Left|child::TableText-Left|child::TableTitle-white-Left">
                    <xsl:attribute name="align">left</xsl:attribute>
                </xsl:when>
            </xsl:choose>
            <xsl:apply-templates/>
        </entry>
    </xsl:template>
    
    
    <xsl:template match="CELL|TF">
        <entry type="tbody">
            <xsl:if test="@ROWSPAN">
                <xsl:choose>
                    <xsl:when test="@ROWSPAN='1'"/>
                    <xsl:otherwise>
                        <xsl:attribute name="rowspan">
                            <xsl:value-of select="@ROWSPAN"/>
                        </xsl:attribute>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:if>
            <xsl:if test="@COLSPAN">
                <xsl:choose>
                    <xsl:when test="@COLSPAN='1'"/>
                    <xsl:otherwise>
                        <xsl:attribute name="colspan">
                            <xsl:value-of select="@COLSPAN"/>
                        </xsl:attribute>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:if>
            
            <xsl:choose>
                <xsl:when test="child::TableTitle-white-Center|child::TableText-Center-Middle|child::TableText-Middle|child::TableText-Center|child::TableTitle-white-Center">
                    <xsl:attribute name="align">center</xsl:attribute>
                </xsl:when>
                <xsl:when test="child::TableTitle-black-Left|child::TableText-Left|child::TableTitle-white-Left">
                    <xsl:attribute name="align">left</xsl:attribute>
                </xsl:when>
            </xsl:choose>
            
            <xsl:apply-templates/>
        </entry>
    </xsl:template>
    
    <xsl:template match="Legend-Text[ancestor::CELL|TH]">
        <xsl:apply-templates/>
    </xsl:template>
    
    
    <xsl:template match="IMAGE">
        <image>
            <xsl:if test="@href">
                <xsl:attribute name="href">
                    <xsl:value-of select="@href"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </image>
    </xsl:template>
    
    <!--Warning-->
    <xsl:template match="Warning-Title-Warning">
        <xsl:choose>
            <xsl:when test="preceding-sibling::*[1][self::Warning-Text]">
                <xsl:text disable-output-escaping="yes"><![CDATA[</cdWarning>]]></xsl:text>
                <xsl:text disable-output-escaping="yes"><![CDATA[<cdWarning type="warning">]]></xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text disable-output-escaping="yes"><![CDATA[<cdWarning type="warning">]]></xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    
    <!--<xsl:template match="Warning-Title-Warning">
        <xsl:text disable-output-escaping="yes"><![CDATA[<note type="warning">]]></xsl:text>
    </xsl:template>-->
    
    <xsl:template match="Warning-Title-Caution|Warning-Title-Caution-Damage">
        <xsl:text disable-output-escaping="yes"><![CDATA[<cdWarning type="caution">]]></xsl:text>
    </xsl:template>
    
    <xsl:template match="Warning-Title-Danger">
        <xsl:text disable-output-escaping="yes"><![CDATA[<cdWarning type="danger">]]></xsl:text>
    </xsl:template>
    
    <xsl:template match="Warning-End">
        <xsl:text disable-output-escaping="yes"><![CDATA[</cdWarning>]]></xsl:text>
    </xsl:template>
    
    <xsl:template match="Body-Note | Notes">
        <note type="note">
            <p><xsl:apply-templates/></p>
        </note>
    </xsl:template>
    <xsl:template match="Warning-End">
        <xsl:text disable-output-escaping="yes"><![CDATA[</cdWarning>]]></xsl:text>
    </xsl:template>
    
    <xsl:template match="Warning-Text">
        <cdWarnDescr>
            <xsl:apply-templates/>
        </cdWarnDescr>
    </xsl:template>
    
    
    
    <xsl:template match="Warning-Text-bold">
        <cdWarnHeading>
            <xsl:apply-templates/>
        </cdWarnHeading>
    </xsl:template>
    
    <xsl:template match="Normal">
        <xsl:choose>
            <xsl:when test="following-sibling::*[1][self::Warning-ToDoList]">
                <cdWarnDescr>
                    <xsl:apply-templates/>
                </cdWarnDescr>
            </xsl:when>
            <xsl:when test="following-sibling::*[1][self::Warning-Title-Warning]">
                <cdWarnDescr>
                    <xsl:apply-templates/>
                </cdWarnDescr>
            </xsl:when>
            <xsl:otherwise>
                <p>
                    <b><xsl:apply-templates/></b>
                </p>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    
    <xsl:template match="Body-bold">
        <p>
            <b><xsl:apply-templates/></b>
        </p>
    </xsl:template>
    
    <xsl:template match="Warning-ToDoList|Warning-BulletList">
        <cdWarnInstructions>
            <xsl:apply-templates/>
        </cdWarnInstructions>
    </xsl:template>
    
    <xsl:template match="Warning-ToDo|Warning-Bullet">
        <cdWarnInstruction>
            <xsl:apply-templates/>
        </cdWarnInstruction>
    </xsl:template>
    
    
    <!--Number List-->
    <xsl:template match="List-Num1List|List-Num-List|Body-NoteList|CAPTION|DIV">
        <!--<ol>-->
            <xsl:apply-templates/>
        <!--</ol>-->
    </xsl:template>
    
    <xsl:template match="Figure-Title">
        <legend>
            <title>
                <xsl:apply-templates/>
            </title>
        </legend>
    </xsl:template>
    
    <xsl:template match="CAPTION[ancestor::TABLE][not(child::title)]">
        <title>
            <xsl:apply-templates/>
        </title>
    </xsl:template>
    
    <xsl:template match="TABLE[descendant::Figure-Number|Figure-Text]">
        <fig>
            <xsl:apply-templates/>
        </fig>
    </xsl:template>
    
    <xsl:template match="TABLE[descendant::Figure-Title][child::ROW[count(1)]]">
        <fig>
            <xsl:apply-templates/>
        </fig>
    </xsl:template>
    
    
    
    <xsl:template match="List-Num1|List-Num-">
        <list-item style="ListNum1">
            <xsl:apply-templates/>
        </list-item>
    </xsl:template>
    
    
    <!--Bullet List-->
    
    <xsl:template match="List-BulletList|EC-StepList|List-DashList">
        <!--<ul>-->
            <xsl:apply-templates/>
        <!--</ul>-->
    </xsl:template>
    <xsl:template match="List-Bullet|Bulleted">
        <li type="bullet">
            <xsl:apply-templates/>
        </li>
    </xsl:template>
    <xsl:template match="List-Dash">
        <li type="bullet">
            <xsl:apply-templates/>
        </li>
    </xsl:template>
    
    <!--Event Code-->
    <xsl:template match="EC-Step">
        <list-item style="ListNum1" type="step">
            <xsl:apply-templates/>
        </list-item>
    </xsl:template>
    
    <xsl:template match="EC-If">
        <list-item style="ListNum2" type="bull">
            <xsl:text>If: </xsl:text><xsl:apply-templates/>
        </list-item>
    </xsl:template>
    
    <xsl:template match="EC-Then">
        <list-item style="ListNum3" type="dash">
            <xsl:apply-templates/>
        </list-item>
    </xsl:template>
    
    <!--Workstep-->
    
    
    <xsl:template match="WorkstepTitle">
        <topic type="3" base="task">
            <title><xsl:apply-templates/></title>
        </topic>
    </xsl:template>
    
    <xsl:template match="Workstep1">
        <list-item style="ListNum1" type="Workstep1">
            <xsl:apply-templates/>
        </list-item>
    </xsl:template>
    
    <xsl:template match="Workstep-">
        <list-item style="ListNum1" type="Workstep1">
            <xsl:apply-templates/>
        </list-item>
    </xsl:template>
    
    <xsl:template match="Footnote[ancestor::CELL] | TableFootnote[ancestor::CELL]">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    
    <xsl:template match="WorkstepResult|WorkstepResult2|WorkstepResult3|WorkstepResult4|WorkstepResult5">
        <stepresult>
            <xsl:apply-templates/>
        </stepresult>
    </xsl:template>
    
    <xsl:template match="FOOTNOTES">
        <fn-group>
            <xsl:apply-templates/>
        </fn-group>
    </xsl:template>
    <xsl:template match="FOOTNOTE">
        <fn>
            <xsl:apply-templates/>
        </fn>
    </xsl:template>
    <xsl:template match="TableFootnote[ancestor::FOOTNOTE]|TableText-Left|Footnote">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    <xsl:template match="Figure-Number|HeadingRunIn">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="A[starts-with(@ID, 'pgfId')]|TableText-Center-Middle|TableTitle-black-Center|TableTitle-black-Left|TableText-Middle|TableText-Center|TableTitle-white-Center|
        Figure-Anchor|TITLE|TableTitle-white-Left|EventCodeAnchorRight|
        Workstep1List|Workstep-List|TableTitle-white">
        <xsl:apply-templates/>
    </xsl:template>
    
    
    
    
</xsl:stylesheet>
