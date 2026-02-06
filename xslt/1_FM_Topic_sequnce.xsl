<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
    xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
    xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
    exclude-result-prefixes="xs w wp a pic xlink r m" version="2.0">
    
    <xsl:template match="node() | @*">
        <xsl:copy>
            <xsl:apply-templates select="node() | @*"/>
        </xsl:copy>
    </xsl:template>
    
    
    <xsl:template match="topic">
        <xsl:choose>
            <xsl:when test="@type='1'">
                <h1>
                    <xsl:if test="descendant::list-item">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'task'"/>
                        </xsl:attribute>
                    </xsl:if>
                    
                    <xsl:if test="descendant::li[@type='ec-step']">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'task'"/>
                        </xsl:attribute>
                    </xsl:if>
                    
                    <xsl:if test="body[child::*[1][self::table]]">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'refernce'"/>
                        </xsl:attribute>
                    </xsl:if>
                    
                    
                    <!--<xsl:if test="child::title/descendant::a/@id">
                        <xsl:attribute name="id">
                            <xsl:value-of select="child::title/descendant::a/@id"/>
                        </xsl:attribute>
                    </xsl:if>-->
                    <xsl:apply-templates select="@*"/>
                    <xsl:apply-templates/>
                </h1>
            </xsl:when>
            <xsl:when test="@type='2'">
                <h2>
                    <xsl:if test="descendant::list-item">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'task'"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:if test="descendant::li[@type='ec-step']">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'task'"/>
                        </xsl:attribute>
                    </xsl:if>
                    
                    <xsl:if test="body[child::*[1][self::table]]">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'refernce'"/>
                        </xsl:attribute>
                    </xsl:if>
                    
                    <xsl:apply-templates select="@*"/>
                    <xsl:apply-templates/>
                </h2>
            </xsl:when>
            <xsl:when test="@type='3'">
                <h3>
                    <xsl:if test="descendant::list-item">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'task'"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:if test="descendant::li[@type='ec-step']">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'task'"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:apply-templates select="@*"/>
                    <xsl:apply-templates/>
                </h3>
            </xsl:when>
            <xsl:when test="@type='4'">
                <h4>
                    <xsl:if test="descendant::list-item">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'task'"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:if test="descendant::li[@type='ec-step']">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'task'"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:apply-templates select="@*"/>
                    <xsl:apply-templates/>
                </h4>
            </xsl:when>
            <xsl:when test="@type='5'">
                <h5>
                    <xsl:if test="descendant::list-item">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'task'"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:if test="descendant::li[@type='ec-step']">
                        <xsl:attribute name="base">
                            <xsl:value-of select="'task'"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:apply-templates select="@*"/>
                    <xsl:apply-templates/>
                </h5>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="table">
        <table>
            <xsl:if test="@id">
                <xsl:attribute name="id" select="@id"/>
            </xsl:if>
            <tgroup>
                <xsl:choose>
                    <xsl:when test="child::thead">
                        <xsl:choose>
                            <xsl:when test="child::thead/row[1]/descendant::entry[1]/@colspan">
                                <xsl:attribute name="cols" select="child::thead/row[1]/descendant::entry[1]/@colspan"/>
                            </xsl:when>
                            <xsl:when test="not(child::thead/row[1]/descendant::entry[1]/@colspan) and child::thead/row[1]/descendant::entry">
                                <xsl:if test="not(child::thead/row[1]/descendant::entry[1]/@colspan)">
                                    <xsl:attribute name="cols" select="child::thead/row[1]/count(descendant::entry)"/>    
                                </xsl:if>
                            </xsl:when>
                        </xsl:choose>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:choose>
                            <xsl:when test="child::tbody/row[1]/descendant::entry[1]/@colspan">
                                <xsl:attribute name="cols" select="child::tbody/row[1]/descendant::entry[1]/@colspan"/>
                            </xsl:when>
                            <xsl:when test="not(child::tbody/row[1]/descendant::entry[1]/@colspan) and child::tbody/row[1]/descendant::entry">
                                <xsl:if test="not(child::tbody/row[1]/descendant::entry[1]/@colspan)">
                                    <xsl:attribute name="cols" select="child::tbody/row[1]/count(descendant::entry)"/>    
                                </xsl:if>
                            </xsl:when>
                        </xsl:choose>
                    </xsl:otherwise>
                </xsl:choose>
                
                <xsl:apply-templates/>
            </tgroup>
        </table>
    </xsl:template>
    
    <xsl:template match="entry[ancestor::thead] | entry[ancestor::tbody]">
        <entry>
            <xsl:if test="@id">
                <xsl:attribute name="id" select="@id"/>
            </xsl:if>
            <xsl:if test="@colspan">
                <xsl:variable name="trElem" select="../row"/>
                <xsl:variable name="spanValue" select="@colspan"/>
                <xsl:variable name="precedingTcNumber" select="
                    sum(for $trElem in preceding-sibling::entry
                    return
                    (if ($trElem/@colspan) then
                    ($trElem/@colspan)
                    else
                    (1)))"/>
                <xsl:attribute name="namest" select="concat('c', $precedingTcNumber + 1)"/>
                <xsl:attribute name="nameend" select="concat('c', $precedingTcNumber + $spanValue)"
                />
            </xsl:if>
            <xsl:if test="@align">
                <xsl:attribute name="align" select="@align"/>
            </xsl:if>
            <xsl:if test="@namest">
                <xsl:attribute name="namest" select="@namest"/>
            </xsl:if>
            <xsl:if test="@nameend">
                <xsl:attribute name="nameend" select="@nameend"/>
            </xsl:if>
            <xsl:if test="@rowspan">
                <xsl:attribute name="morerows" select="@rowspan - 1"/>
            </xsl:if>
            <xsl:if test="@morerows">
                <xsl:attribute name="morerows" select="@morerows"/>
            </xsl:if>
            <xsl:apply-templates/>
        </entry>
    </xsl:template>
    <xsl:template match="title[child::b]">
        <title>
            <xsl:apply-templates/>
        </title>
    </xsl:template>
    <xsl:template match="ol[not(child::li)]">
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="info">
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="a">
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="xref">
        <xsl:apply-templates/>
    </xsl:template>
    
    
    
    <xsl:template match="fig[descendant::a]">
        <fig>
            <xsl:attribute name="id">
                <xsl:value-of select="descendant::a/@id"/>
            </xsl:attribute>
            <xsl:apply-templates/>
        </fig>
    </xsl:template>
    <xsl:template match="a[ancestor::fig]"/>
    <xsl:template match="@style"/>
    
    
    <xsl:template match="Normal">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    
    
    <xsl:template match="ul">
        <ul>
            <xsl:if test="@id">
                <xsl:attribute name="id" select="@id"/>
            </xsl:if>
            <xsl:if test="@type='to-do-list'">
                <xsl:attribute name="type" select="'to-do-list'"/>
            </xsl:if>
            <xsl:apply-templates/>
        </ul>
    </xsl:template>
    
    <xsl:template match="note">
        <xsl:choose>
            <xsl:when test="not(@type)">
                <note type="note">
                    <xsl:if test="@id">
                        <xsl:attribute name="id" select="@id"/>
                    </xsl:if>
                    <xsl:apply-templates/>
                </note>
            </xsl:when>
            <xsl:otherwise>
                <note>
                    <xsl:apply-templates select="@*"/>
                    <xsl:apply-templates/>
                </note>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="notes">
        <note type="note">
            <xsl:apply-templates/>
        </note>
    </xsl:template>
    
    <xsl:template match="note[@type='caution']">
        <cdWarning type="caution">
            <xsl:apply-templates/>
        </cdWarning>
    </xsl:template>
    
    <xsl:template match="note[@type='warning']">
        <cdWarning type="warning">
            <xsl:apply-templates/>
        </cdWarning>
    </xsl:template>
    
    <xsl:template match="note[@type='danger']">
        <cdWarning type="danger">
            <xsl:apply-templates/>
        </cdWarning>
    </xsl:template>
    
    
    <xsl:template match="title[ancestor::note[@type='warning']|ancestor::note[@type='danger']|ancestor::note[@type='caution']]">
        <cdWarnHeading>
            <xsl:apply-templates/>
        </cdWarnHeading>
    </xsl:template>
    
    <xsl:template match="p[ancestor::note[@type='warning']|ancestor::note[@type='danger']|ancestor::note[@type='caution']]">
        <cdWarnDescr>
            <xsl:apply-templates/>
        </cdWarnDescr>
    </xsl:template>
    <xsl:template match="ul[ancestor::note[@type='warning']|ancestor::note[@type='danger']|ancestor::note[@type='caution']]">
        <cdWarnInstructions>
            <xsl:apply-templates/>
        </cdWarnInstructions>
    </xsl:template>
    <xsl:template match="li[ancestor::note[@type='warning']|ancestor::note[@type='danger']|ancestor::note[@type='caution']]">
        <cdWarnInstruction>
            <xsl:apply-templates/>
        </cdWarnInstruction>
    </xsl:template>
    
    
    <xsl:template match="li[not(ancestor::ul)][(following-sibling::list-item)]">
        <xsl:if test="not(preceding-sibling::*[1][self::li])">
            <xsl:text disable-output-escaping="yes"><![CDATA[<ullist>]]></xsl:text>
        </xsl:if>
        <xsl:copy>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
        <xsl:if test="not(following-sibling::*[1][self::li])">
            <xsl:text disable-output-escaping="yes"><![CDATA[</ullist>]]></xsl:text>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="p [@type='codeph']">
        <p>
            <codeph>
                <xsl:apply-templates/>
            </codeph> 
        </p>
    </xsl:template>
    
    <xsl:template match="list-item">
        <xsl:choose>
            <xsl:when test="@type='num2' and not(preceding-sibling::list-item [@type='num1'])">
                <list-item type="num1">
                    <xsl:apply-templates/>
                </list-item>
            </xsl:when>
            <xsl:when test="@type='num3' and not(preceding-sibling::list-item [@type='num2'])">
                <list-item type="num1">
                    <xsl:apply-templates/>
                </list-item>
            </xsl:when>
            <xsl:otherwise>
                <list-item>
                    <xsl:copy-of select="@*"/>
                    <xsl:apply-templates/>
                </list-item>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="li [@type='num1']">
        <list-item>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </list-item>
    </xsl:template>
    
    
    <xsl:template match="url">
        <xref>
            <xsl:attribute name="href" select="@href"/>
            <xsl:attribute name="scope" select="'external'"/>
            <xsl:attribute name="format" select="'html'"/>
            <xsl:apply-templates/>
        </xref>
    </xsl:template>
    
    
    <xsl:template match="li [@type='WorkstepResult'] | li [@type='WorkstepResult2']| li [@type='WorkstepResult3'] |
        list-item [@type='WorkstepResult'] | list-item [@type='WorkstepResult2']| list-item [@type='WorkstepResult3']">
        <p id="{concat('stepresult', generate-id())}">
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    
    <xsl:template match="linktext|list|ol|lst">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="p[starts-with(., '•')]">
        <li type="bull1">
            <xsl:apply-templates/>
        </li>
    </xsl:template>
    <xsl:template match="LD2-Dash2">
        <li type="bull2">
            <xsl:apply-templates/>
        </li>
    </xsl:template>
    
    <xsl:template match="@filename" priority="10">
        <xsl:variable name="fname" select="."/>
        <xsl:variable name="pos"
            select="count(preceding::*/@filename[. = $fname]) + 1"/>
        
        <xsl:attribute name="filename">
            <xsl:choose>
                <xsl:when test="$pos = 1">
                    <xsl:value-of select="$fname"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="concat($fname, '_', $pos)"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:attribute>
    </xsl:template>
    
    
    <xsl:template match="li [@type='bull2'][preceding-sibling::li [@type='ec-step']]">
        <choption><xsl:apply-templates/></choption>
    </xsl:template>
    
    <xsl:template match="li [@type='bull3'][preceding-sibling::li [@type='ec-step']]">
        <chdesc><xsl:apply-templates/></chdesc>
    </xsl:template>
    
    <xsl:template match="li [@type='ec-step']">
        <list-item type="num1">
            <xsl:apply-templates/>
        </list-item>
    </xsl:template>
    
    
    <xsl:template match="Warning-End"/>
    
    
    <xsl:template match="fig[ancestor::title]|@level"/>
    
    
    
    
</xsl:stylesheet>
