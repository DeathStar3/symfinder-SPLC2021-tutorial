/*
 * This file is part of symfinder.
 *
 * symfinder is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * symfinder is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with symfinder. If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2018-2019 Johann Mortara <johann.mortara@univ-cotedazur.fr>
 * Copyright 2018-2019 Xhevahire Tërnava <xhevahire.ternava@lip6.fr>
 * Copyright 2018-2019 Philippe Collet <philippe.collet@univ-cotedazur.fr>
 */

import neo4j_types.EntityAttribute;
import neo4j_types.EntityType;
import neo4j_types.RelationType;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.types.Node;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;


public class HotspotTest extends Neo4jTest {


    @Test
    @Disabled
    public void hotspotsBetweenVariants() {
        runTest(graph -> {
            Node vp1 = graph.createNode("VP1", EntityType.CLASS, EntityAttribute.VP);
            Node v1 = graph.createNode("V1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node v2 = graph.createNode("V2", EntityType.CLASS, EntityAttribute.VARIANT);
            Node v3 = graph.createNode("V3", EntityType.CLASS, EntityAttribute.VARIANT);
            graph.setNodeAttribute(v2, "constructorVariants", 2);
            graph.setNodeAttribute(v2, "methodVariants", 1);
            graph.linkTwoNodes(vp1, v1, RelationType.EXTENDS);
            graph.linkTwoNodes(vp1, v2, RelationType.EXTENDS);
            graph.linkTwoNodes(v3, v2, RelationType.USE);
            graph.detectHotspotsWithNewDefinition(3, 3);
            assertTrue(graph.getNode("VP1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("V1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("V2").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("V3").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }
    @Test
    @Disabled
    public void hotspotsBetweenVariantsButThresholdIsTooHigh() {
        runTest(graph -> {
            Node vp1 = graph.createNode("VP1", EntityType.CLASS, EntityAttribute.VP);
            Node v1 = graph.createNode("V1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node v2 = graph.createNode("V2", EntityType.CLASS, EntityAttribute.VARIANT);
            Node v3 = graph.createNode("V3", EntityType.CLASS, EntityAttribute.VARIANT);
            graph.setNodeAttribute(v2, "constructorVariants", 2);
            graph.setNodeAttribute(v2, "methodVariants", 1);
            graph.linkTwoNodes(vp1, v1, RelationType.EXTENDS);
            graph.linkTwoNodes(vp1, v2, RelationType.EXTENDS);
            graph.linkTwoNodes(v3, v2, RelationType.USE);
            graph.detectHotspotsWithNewDefinition(5, 3);
            assertFalse(graph.getNode("VP1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("V1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("V2").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("V3").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void hotspotsBetweenVariantAndVP() {
        runTest(graph -> {
            Node vp1 = graph.createNode("VP1", EntityType.CLASS, EntityAttribute.VP);
            Node v1 = graph.createNode("V1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node v2 = graph.createNode("V2", EntityType.CLASS, EntityAttribute.VARIANT);
            Node v3 = graph.createNode("V3", EntityType.CLASS, EntityAttribute.VARIANT);
            graph.linkTwoNodes(vp1, v1, RelationType.EXTENDS);
            graph.linkTwoNodes(vp1, v2, RelationType.EXTENDS);
            graph.linkTwoNodes(v3, vp1, RelationType.USE);
            graph.setNodeAttribute(vp1, "classVariants", 2);
            graph.detectHotspotsWithNewDefinition(2, 3);
            assertTrue(graph.getNode("VP1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    @Disabled("Check for the densityVariants attribute")
    public void hotspotsBetweenVariantAndVPAtTwoHops() {
        runTest(graph -> {
            Node vp1 = graph.createNode("VP1", EntityType.CLASS, EntityAttribute.VP);
            Node vp1v1 = graph.createNode("VP1V1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node vp1v2 = graph.createNode("VP1V2", EntityType.CLASS, EntityAttribute.VARIANT);
            Node vp2 = graph.createNode("VP2", EntityType.CLASS, EntityAttribute.VARIANT);
            Node vp2v1 = graph.createNode("VP2V1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node v3 = graph.createNode("V3", EntityType.CLASS, EntityAttribute.VARIANT);
            graph.linkTwoNodes(vp1, vp1v1, RelationType.EXTENDS);
            graph.linkTwoNodes(vp1, vp1v2, RelationType.EXTENDS);
            graph.linkTwoNodes(vp2, vp2v1, RelationType.EXTENDS);
            graph.linkTwoNodes(vp1, v3, RelationType.USE);
            graph.linkTwoNodes(vp2v1, v3, RelationType.USE);
            graph.setNodeAttribute(vp1, "classVariants", 2);
            graph.setNodeAttribute(vp2v1, "constructorVariants", 2);
            graph.setNodeAttribute(vp2v1, "methodVariants", 1);
            graph.detectHotspotsWithNewDefinition(0, 3);
            assertTrue(graph.getNode("VP1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("VP2").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    @Disabled("Check for the densityVariants attribute")
    public void hotspotsBetweenVariantsAtTwoHops() {
        runTest(graph -> {
            Node vp1 = graph.createNode("VP1", EntityType.CLASS, EntityAttribute.VP);
            Node vp1v1 = graph.createNode("VP1V1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node vp1v2 = graph.createNode("VP1V2", EntityType.CLASS, EntityAttribute.VARIANT);
            Node vp2 = graph.createNode("VP2", EntityType.CLASS, EntityAttribute.VARIANT);
            Node vp2v1 = graph.createNode("VP2V1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node v3 = graph.createNode("V3", EntityType.CLASS, EntityAttribute.VARIANT);
            graph.linkTwoNodes(vp1, vp1v1, RelationType.EXTENDS);
            graph.linkTwoNodes(vp1, vp1v2, RelationType.EXTENDS);
            graph.linkTwoNodes(vp2, vp2v1, RelationType.EXTENDS);
            graph.linkTwoNodes(vp1v1, v3, RelationType.USE);
            graph.linkTwoNodes(vp2v1, v3, RelationType.USE);
            graph.setNodeAttribute(vp1, "classVariants", 2);
            graph.setNodeAttribute(vp1v1, "constructorVariants", 2);
            graph.setNodeAttribute(vp1v1, "methodVariants", 1);
            graph.setNodeAttribute(vp2v1, "constructorVariants", 2);
            graph.setNodeAttribute(vp2v1, "methodVariants", 1);
            graph.detectHotspotsWithNewDefinition(0, 3);
            assertTrue(graph.getNode("VP1V1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("VP2V1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("VP1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

}
